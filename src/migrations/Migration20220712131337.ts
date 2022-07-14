import { Migration } from '@mikro-orm/migrations';

export class Migration20220712131337 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "username" text not null, "password" text not null);');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql('alter table "post" alter column "created_at" drop default;');
    this.addSql('alter table "post" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "post" alter column "updated_at" drop default;');
    this.addSql('alter table "post" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));');
    this.addSql('alter table "post" alter column "title" type varchar(255) using ("title"::varchar(255));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user" cascade;');

    this.addSql('alter table "post" alter column "created_at" type timestamptz using ("created_at"::timestamptz);');
    this.addSql('alter table "post" alter column "created_at" set default \'2022-07-10 15:30:13.88253+03\';');
    this.addSql('alter table "post" alter column "updated_at" type timestamptz using ("updated_at"::timestamptz);');
    this.addSql('alter table "post" alter column "updated_at" set default \'2022-07-10 15:30:13.88253+03\';');
    this.addSql('alter table "post" alter column "title" type text using ("title"::text);');
  }

}
