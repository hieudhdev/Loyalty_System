import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1728893961767 implements MigrationInterface {
    name = 'Init1728893961767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_efba48c6a0c7a9b6260f771b165" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "UserRoles" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "role_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "roleId" integer, CONSTRAINT "PK_a44a2382829972daa2a31345f56" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "LoyaltyPointRules" ("id" SERIAL NOT NULL, "points_ratio" numeric NOT NULL, "is_active" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c1c2436a9d7e5e083132fb578a2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "TransactionTypes" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "loyalty_point_rule_id" integer NOT NULL, "description" character varying NOT NULL, "category" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "loyaltyPointRuleId" integer, CONSTRAINT "PK_a959555a74460487129c1334d60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."LoyaltyPointsHistory_points_change_type_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "LoyaltyPointsHistory" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "transaction_id" integer NOT NULL, "points_change_type" "public"."LoyaltyPointsHistory_points_change_type_enum" NOT NULL, "points" integer NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "transactionId" integer, CONSTRAINT "PK_ee491d25a428a0b09cc8534d905" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Transactions" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "transaction_type_id" integer NOT NULL, "amount" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "transactionTypeId" integer, CONSTRAINT "PK_7761bf9766670b894ff2fdb3700" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "phone_number" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Point" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "total_points" integer NOT NULL, "expired_time" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_473114b97ec7eb032b454df1711" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "UserRoles" ADD CONSTRAINT "FK_a6b832f61ba4bd959c838a1953b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserRoles" ADD CONSTRAINT "FK_5f1d6fdea1024424fd60b193b9f" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "TransactionTypes" ADD CONSTRAINT "FK_9762d705893fa4e692ab2597bbc" FOREIGN KEY ("loyaltyPointRuleId") REFERENCES "LoyaltyPointRules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "LoyaltyPointsHistory" ADD CONSTRAINT "FK_0451504eb4c1f11d20bb27fd178" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "LoyaltyPointsHistory" ADD CONSTRAINT "FK_0da1fa4e38ec72bfaa454e156a4" FOREIGN KEY ("transactionId") REFERENCES "Transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Transactions" ADD CONSTRAINT "FK_f01450fedf7507118ad25dcf41e" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Transactions" ADD CONSTRAINT "FK_79e5c11ebd8793b0135494ed6b1" FOREIGN KEY ("transactionTypeId") REFERENCES "TransactionTypes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Point" ADD CONSTRAINT "FK_ab4c313d9d938090be0d467c058" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Point" DROP CONSTRAINT "FK_ab4c313d9d938090be0d467c058"`);
        await queryRunner.query(`ALTER TABLE "Transactions" DROP CONSTRAINT "FK_79e5c11ebd8793b0135494ed6b1"`);
        await queryRunner.query(`ALTER TABLE "Transactions" DROP CONSTRAINT "FK_f01450fedf7507118ad25dcf41e"`);
        await queryRunner.query(`ALTER TABLE "LoyaltyPointsHistory" DROP CONSTRAINT "FK_0da1fa4e38ec72bfaa454e156a4"`);
        await queryRunner.query(`ALTER TABLE "LoyaltyPointsHistory" DROP CONSTRAINT "FK_0451504eb4c1f11d20bb27fd178"`);
        await queryRunner.query(`ALTER TABLE "TransactionTypes" DROP CONSTRAINT "FK_9762d705893fa4e692ab2597bbc"`);
        await queryRunner.query(`ALTER TABLE "UserRoles" DROP CONSTRAINT "FK_5f1d6fdea1024424fd60b193b9f"`);
        await queryRunner.query(`ALTER TABLE "UserRoles" DROP CONSTRAINT "FK_a6b832f61ba4bd959c838a1953b"`);
        await queryRunner.query(`DROP TABLE "Point"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Transactions"`);
        await queryRunner.query(`DROP TABLE "LoyaltyPointsHistory"`);
        await queryRunner.query(`DROP TYPE "public"."LoyaltyPointsHistory_points_change_type_enum"`);
        await queryRunner.query(`DROP TABLE "TransactionTypes"`);
        await queryRunner.query(`DROP TABLE "LoyaltyPointRules"`);
        await queryRunner.query(`DROP TABLE "UserRoles"`);
        await queryRunner.query(`DROP TABLE "Roles"`);
    }

}
