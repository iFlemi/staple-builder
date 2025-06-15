import Stapler from "@/pages/Stapler"
import { getPackages } from "@/functions/packageLookup"
import { loadAllCards } from "@/functions/populateCards"

export async function getStaticProps() {
  const packages = await getPackages()
  const cacheEntries = await loadAllCards()
  return { props: { packages, cacheEntries } }
}

const StaplerServer = async () => {
  const { props } = await getStaticProps()
  return <Stapler packages={props.packages} cacheEntries={props.cacheEntries} />
}

export default StaplerServer
