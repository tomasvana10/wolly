CREATE TABLE "machine" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "machine_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"mac" "macaddr" NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"passkey" numeric NOT NULL
);
