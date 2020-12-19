CREATE DATABASE shakestats;

create extension if not exists "uuid-ossp";

CREATE TABLE blocks(
    height integer PRIMARY KEY NOT NULL,
    hash text NOT NULL UNIQUE,
    block_date DATE NOT NULL,
    burned integer,
    bids integer,
    amount_bid integer
);

CREATE TABLE names(
    hash text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    claimed boolean NOT NULL DEFAULT FALSE,
    value integer,
    highest integer,
    bids integer,
    amount_bid integer
);
