import { getFileContentsInDirectory } from "@/functions/loadFromFile"
import { FilePackage } from "@/domain/Package"
import { FileData } from "@/domain/FileData"
import { fileContentsToCardNames } from "@/functions/cachePopulator"

const packageDirectory = "./public/packages"

export const getPackages = async () =>
  (await getFileContentsInDirectory(packageDirectory)).map(fileDataToPackage)

export const fileDataToPackage = (fileData: FileData): FilePackage => ({
  name: fileData.fileName,
  cardNames: fileContentsToCardNames(fileData.fileContents),
})
