-- CreateTable
CREATE TABLE "Driver" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "idCard" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_idCard_key" ON "Driver"("idCard");
