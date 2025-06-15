"use client"

import { useState } from "react"
import { ColourCharacter } from "@/domain/Colour"
import { ManaColours } from "@/domain/UI/ManaColours"
import { FilePackage } from "@/domain/Package"
import { PackageView } from "@/domain/UI/PackageView"
import { stringToColourIdentity } from "@/functions/colourParser"
import { CardCache, newCardCache } from "@/functions/cardCache"
import { PrettyPrinter } from "mismatched"
import { getDeckExport, toMTGAExport } from "@/functions/deckExport"

interface Props {
  packages: FilePackage[]
  cacheEntries: [string, string[]][]
}

const Stapler = ({ packages, cacheEntries }: Props) => {
  const [selectedMana, setSelectedMana] = useState({
    W: false,
    B: false,
    R: false,
    G: false,
    U: false,
    C: false,
  })
  const [exportText, setExportText] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  const [selectedPackages, setSelectedPackages] = useState<PackageView>(() =>
    packages.reduce(
      (acc, p) => ({ ...acc, [p.name]: false }),
      {} as PackageView,
    ),
  )

  const manaColors = ManaColours

  const toggleMana = (symbol: ColourCharacter) => {
    setSelectedMana((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }))
  }

  const togglePackage = (packageName: string) => {
    setSelectedPackages((prev) => ({
      ...prev,
      [packageName]: !prev[packageName],
    }))
  }

  const handleExport = async () => {
    const colours = stringToColourIdentity(
      Object.entries(selectedMana)
        .filter(([_, selected]) => selected)
        .map(([symbol, _]) => symbol)
        .join(""),
    )
    if (colours.isLeft()) return console.error(colours.getLeft())

    const selectedPackageNames = Object.entries(selectedPackages)
      .filter(([_, selected]) => selected)
      .map(([name, _]) => name)

    const cardNames = new Set(
      packages
        .filter((p) => selectedPackageNames.includes(p.name))
        .map((p) => p.cardNames)
        .flat(),
    )

    const cache = newCardCache()
    cache.fromEntries(cacheEntries)
    const lookedUpCards = cache.lookup(colours.get()).intersection(cardNames)

    const deckExport = getDeckExport([...lookedUpCards])
    const exportString = toMTGAExport(deckExport)
    setExportText(exportString)

    try {
      await navigator.clipboard.writeText(exportString)
      console.log("Copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 1000)
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-8 text-center">Brawl Stapler</h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Column 1 */}
          <div className="space-y-6">
            {/* Mana Symbol Bar */}
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2">
                {manaColors.map(({ symbol, color, name }) => (
                  <button
                    key={symbol}
                    onClick={() => toggleMana(symbol)}
                    className={`
                      w-12 h-12 border-2 flex items-center justify-center p-1
                      transition-all duration-200 hover:scale-105 rounded-full
                      ${color}
                      ${selectedMana[symbol] ? `ring-4 ${manaColors.find((mc) => mc.symbol === symbol)?.ring} ring-opacity-50` : ""}
                    `}
                    title={name}
                  >
                    <img
                      src={`/mana-symbols/${symbol}.svg`}
                      alt={`${name} mana symbol`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Package List */}
            <div className="space-y-4">
              {Object.entries(selectedPackages).map(
                ([packageName, isSelected]) => (
                  <div
                    key={packageName}
                    className="flex items-center space-x-3"
                  >
                    <input
                      type="checkbox"
                      id={packageName}
                      checked={isSelected}
                      onChange={() => togglePackage(packageName)}
                      className="w-5 h-5 border-2 border-black"
                    />
                    <label
                      htmlFor={packageName}
                      className="text-xl font-semibold cursor-pointer select-none"
                    >
                      {packageName}
                    </label>
                    {packageName === "Package 1" && (
                      <div className="ml-4">
                        <div className="w-2 h-2 bg-black rounded-full mb-1"></div>
                        <div className="w-2 h-2 bg-black rounded-full mb-1"></div>
                        <div className="w-3 h-2 bg-black rounded-full"></div>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {/* Export Preview Box */}
            <div className="p-4 h-96">
              <h2 className="text-xl font-bold mb-4">Export Preview</h2>
              <textarea
                value={exportText}
                onChange={(e) => setExportText(e.target.value)}
                className="w-full h-64 p-2 border border-gray-300 resize-none font-mono text-sm"
                placeholder="Select colours and packages to preview deck list..."
              />
            </div>

            {/* Export Button */}
            <div className="flex justify-end">
              <button
                onClick={handleExport}
                className="px-6 py-2 border-2 border-black bg-white hover:bg-gray-100 font-semibold text-lg transition-colors"
              >
                {copySuccess ? "Copied!" : "Export"}
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Current Selection:</h3>
          <p>
            <strong>Mana:</strong>{" "}
            {Object.entries(selectedMana)
              .filter(([_, selected]) => selected)
              .map(([symbol, _]) => symbol)
              .join(", ") || "None"}
          </p>
          <p>
            <strong>Packages:</strong>{" "}
            {Object.entries(selectedPackages)
              .filter(([_, selected]) => selected)
              .map(([name, _]) => name)
              .join(", ") || "None"}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Stapler
