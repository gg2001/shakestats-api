-- CreateTable
CREATE TABLE "Block" (
"height" SERIAL,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "bids" INTEGER NOT NULL,
    "openInterest" INTEGER NOT NULL,
    "transactions" INTEGER NOT NULL,
    "burned" INTEGER,
    "locked" INTEGER,
    "created" INTEGER,

    PRIMARY KEY ("height")
);

-- CreateTable
CREATE TABLE "Date" (
    "date" TIMESTAMP(3) NOT NULL,
    "startHeight" INTEGER NOT NULL,
    "bids" INTEGER NOT NULL,
    "openInterest" INTEGER NOT NULL,
    "transactions" INTEGER NOT NULL,
    "burned" INTEGER,
    "locked" INTEGER,
    "created" INTEGER,

    PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "Name" (
    "name" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "bids" INTEGER NOT NULL,
    "openInterest" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "highestBid" INTEGER NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "inUse" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("name")
);
