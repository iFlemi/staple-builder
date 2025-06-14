import { getFileContentsInDirectory } from "@/functions/loadFromFile"
import { fileDataToCardList } from "@/functions/cardNameListParser"

const directories = ["../utils/card-lists/uncommon", "../utils/card-lists/rare"]

export const loadAllCards = async (directories: string[]) => {
  const fileData = (
    await Promise.all(directories.map(getFileContentsInDirectory))
  )
    .flat()
    .map(fileDataToCardList)
}
