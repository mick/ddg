#[macro_use] extern crate rocket;
use rocket::serde::{Deserialize, json::Json};
use rocket::response::{self, Responder};
use rocket::http::Status;
use rocket::Request;
use rocket::fs::{FileServer, relative};
use thiserror::Error;
use std::borrow::Cow;
use arrow_ipc::writer::StreamWriter;

use duckdb::Connection;
use duckdb::arrow::record_batch::RecordBatch;



#[derive(Error, Debug)]
pub enum Error {
    #[error("HTTP Error {source:?}")]
    Rocket {
        #[from] source: rocket::Error,
    },
    #[error("SerdeJson Error {source:?}")]
    SerdeJson {
        #[from] source: serde_json::Error,
    },
    #[error("Duckdb Error {source:?}")]
    Duckdb {
        #[from] source: duckdb::Error,
    },
    #[error("Arrow Error {source:?}")]
    Arrow {
        #[from] source: arrow::error::ArrowError,
    },
}

impl<'r, 'o: 'r> Responder<'r, 'o> for Error {
    fn respond_to(self, req: &'r Request<'_>) -> response::Result<'o> {
        match self {
            _ => Status::InternalServerError.respond_to(req)
        }
    }
}

#[derive(Deserialize)]
#[serde(crate = "rocket::serde")]
struct QueryRequest<'r> {
    query: Cow<'r, str>
}


#[post("/query", data = "<query_request>")]
fn run_query(query_request: Json<QueryRequest<'_>>) -> Result<Vec<u8>, Error> {
    let conn: Connection = Connection::open_in_memory()?;
    let mut stmt: duckdb::Statement<'_> = conn.prepare(&query_request.query)?;
    let rbs: Vec<RecordBatch> = stmt.query_arrow([])?.collect();
    let mut buf = Vec::new();
    {
        let mut writer = StreamWriter::try_new(&mut buf, &rbs[0].schema())?;

        for batch in stmt.query_arrow([])? {
            writer.write(&batch)?;
        }
        writer.finish()?;
    }
    Ok(buf)
}


#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", FileServer::from(relative!("dist")))
        .mount("/", routes![run_query])
}