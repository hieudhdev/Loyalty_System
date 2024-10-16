import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: 'hieudh',
    password: '123456',
    database: 'nesttraindb',
    entities: [__dirname + "/../../entities/**/*.js"],
    migrations: ["src/database/migrations/*.js"],
    synchronize: true,
})
