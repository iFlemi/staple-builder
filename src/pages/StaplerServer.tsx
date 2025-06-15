import Stapler from "@/pages/Stapler"
import { getPackages } from "@/functions/packageLookup"
import { loadAllCards } from "@/functions/populateCards"

const StaplerServer = async () => {
  const packages = await getPackages()
  const cacheEntries = await loadAllCards()
  return <Stapler packages={packages} cacheEntries={cacheEntries} />
}

export default StaplerServer
