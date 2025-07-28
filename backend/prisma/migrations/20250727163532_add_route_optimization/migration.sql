-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "estimatedArrival" TIMESTAMP(3),
ADD COLUMN     "optimizedRoute" JSONB,
ADD COLUMN     "routeDistance" DOUBLE PRECISION,
ADD COLUMN     "routeDuration" INTEGER,
ADD COLUMN     "routeInstructions" JSONB,
ADD COLUMN     "routePolyline" TEXT;
