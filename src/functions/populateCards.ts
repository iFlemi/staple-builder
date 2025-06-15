import { getFileContentsInDirectory } from "@/functions/loadFromFile"
import { pipe } from "weland"
import { Result } from "@/utils/Result"
import { loadFileDataIntoCache } from "@/functions/cachePopulator"
import { newCardCache } from "@/functions/cardCache"

const staticCardDirectory = "./public/card-lists/static"

export const loadAllCards = async () => {
  const fileData = await getFileContentsInDirectory(staticCardDirectory)
  const cache = newCardCache()

  const cards = pipe(
    fileData.map((fd) => loadFileDataIntoCache(fd, cache)),
    Result.sequence,
    Result.map((r) => r.flat()),
  )

  if (cards.isLeft())
    console.error({
      ...cards.getLeft(),
      context: `loadAllCards() Failed to load cards into cache`,
    })

  return cache.getEntries()
}
