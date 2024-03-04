import { PrismaClient } from "@prisma/client";
import DataLoader from "dataloader";

export type Loaders = {
    [key: string]: DataLoader<unknown, unknown>;
};

export type Context = {
    prisma: PrismaClient;
    loaders: Loaders;
};