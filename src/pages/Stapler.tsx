"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { ColourCharacter } from "@/domain/Colour"
import { ManaColours } from "@/domain/UI/ManaColours"
import { FilePackage } from "@/domain/Package"
import { PackageView } from "@/domain/UI/PackageView"
import { stringToColourIdentity } from "@/functions/colourParser"
import { newCardCache } from "@/functions/cardCache"
import { getDeckExport, toMTGAExport } from "@/functions/deckExport"

interface Props {
  packages: FilePackage[]
  cacheEntries: [string, string[]][]
}

interface Toast {
  id: string
  message: string
  type: "error" | "warning" | "success"
  duration?: number
}

const Stapler = ({ packages, cacheEntries }: Props) => {
  if (!packages || !Array.isArray(packages)) {
    return <div>Loading...</div>
  }

  const [selectedMana, setSelectedMana] = useState({
    W: false,
    B: false,
    R: false,
    G: false,
    U: false,
    C: true,
  })
  const [exportText, setExportText] = useState("")
  const [commanderName, setCommanderName] = useState("Progenitus")
  const [deckName, setDeckName] = useState("Brawl Stapler Deck")
  const [isLoading, setIsLoading] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const [selectedPackages, setSelectedPackages] = useState<PackageView>(() =>
    packages.reduce(
      (acc, p) => ({ ...acc, [p.name]: false }),
      {} as PackageView,
    ),
  )

  const manaColors = ManaColours
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)

  const addToast = useCallback(
    (message: string, type: Toast["type"], duration = 5000) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, duration)
      }
    },
    [],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const populateExportList = useCallback((): string => {
    const colours = stringToColourIdentity(
      Object.entries(selectedMana)
        .filter(([_, selected]) => selected)
        .map(([symbol, _]) => symbol)
        .join(""),
    )

    if (colours.isLeft()) {
      console.error(colours.getLeft())
      return ""
    }

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

    const deckExportResult = getDeckExport(
      [...lookedUpCards],
      commanderName,
      deckName,
    )

    if (deckExportResult.isLeft()) {
      console.error(deckExportResult.getLeft())
      addToast(deckExportResult.getLeft().message, "error")
      return ""
    }

    const deckExport = deckExportResult.get()
    if (deckExport.cardLines.length > 99) {
      addToast(
        "Deck is too large for Brawl, it will import as Timeless",
        "warning",
      )
    }

    const exportString = toMTGAExport(deckExport)
    setExportText(exportString)
    return exportString
  }, [
    selectedMana,
    selectedPackages,
    packages,
    cacheEntries,
    commanderName,
    deckName,
    addToast,
  ])

  const debouncedPopulateExportList = useCallback(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Prevent multiple simultaneous executions
    if (isProcessingRef.current) {
      return
    }

    setIsLoading(true)

    debounceRef.current = setTimeout(() => {
      isProcessingRef.current = true

      try {
        // Get fresh state values at execution time
        setSelectedMana((currentMana) => {
          setSelectedPackages((currentPackages) => {
            setCommanderName((currentCommander) => {
              setDeckName((currentDeckName) => {
                // Execute with current state values
                const colours = stringToColourIdentity(
                  Object.entries(currentMana)
                    .filter(([_, selected]) => selected)
                    .map(([symbol, _]) => symbol)
                    .join(""),
                )

                if (colours.isLeft()) {
                  console.error(colours.getLeft())
                  setExportText("")
                  return currentDeckName
                }

                const selectedPackageNames = Object.entries(currentPackages)
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
                const lookedUpCards = cache
                  .lookup(colours.get())
                  .intersection(cardNames)

                const deckExportResult = getDeckExport(
                  [...lookedUpCards],
                  currentCommander,
                  currentDeckName,
                )

                if (deckExportResult.isLeft()) {
                  console.error(deckExportResult.getLeft())
                  addToast(deckExportResult.getLeft().message, "error")
                  setExportText("")
                  return currentDeckName
                }

                const deckExport = deckExportResult.get()
                if (deckExport.cardLines.length > 99) {
                  addToast(
                    "Deck is too large for Brawl, it will import as Timeless",
                    "warning",
                  )
                }

                const exportString = toMTGAExport(deckExport)
                setExportText(exportString)

                return currentDeckName
              })
              return currentCommander
            })
            return currentPackages
          })
          return currentMana
        })
      } catch (error) {
        console.error("Error populating export list:", error)
        addToast("An error occurred while building the deck", "error")
      } finally {
        setIsLoading(false)
        isProcessingRef.current = false
      }
    }, 300) // 300ms debounce delay
  }, [packages, cacheEntries, addToast])

  const toggleMana = (symbol: ColourCharacter) => {
    setSelectedMana((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }))
    debouncedPopulateExportList()
  }

  const togglePackage = (packageName: string) => {
    setSelectedPackages((prev) => ({
      ...prev,
      [packageName]: !prev[packageName],
    }))
    debouncedPopulateExportList()
  }

  const handleCommanderNameBlur = () => {
    debouncedPopulateExportList()
  }

  const handleDeckNameBlur = () => {
    debouncedPopulateExportList()
  }

  const handleExport = async () => {
    if (isLoading || isProcessingRef.current) {
      return
    }

    // If no export text, generate it with current state
    let exportString = exportText
    if (!exportString) {
      const colours = stringToColourIdentity(
        Object.entries(selectedMana)
          .filter(([_, selected]) => selected)
          .map(([symbol, _]) => symbol)
          .join(""),
      )

      if (colours.isLeft()) {
        addToast("Invalid color selection", "error")
        return
      }

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

      const deckExportResult = getDeckExport(
        [...lookedUpCards],
        commanderName,
        deckName,
      )

      if (deckExportResult.isLeft()) {
        addToast(deckExportResult.getLeft().message, "error")
        return
      }

      exportString = toMTGAExport(deckExportResult.get())
    }

    try {
      await navigator.clipboard.writeText(exportString)
      console.log("Copied to clipboard!")
      addToast("Copied to clipboard!", "success", 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
      addToast("Failed to copy to clipboard", "error")
    }
  }

  // Toast Component
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out
            ${toast.type === "error" ? "bg-red-50 border-red-500 text-red-700" : ""}
            ${toast.type === "warning" ? "bg-amber-50 border-amber-500 text-amber-700" : ""}
            ${toast.type === "success" ? "bg-green-50 border-green-500 text-green-700" : ""}
          `}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="h-screen bg-white p-6 flex flex-col">
      <ToastContainer />

      <div className="max-w-6xl mx-auto flex-1 flex flex-col">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-8 text-center">Brawl Stapler</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {/* Column 1 - Takes 1/3 width */}
          <div className="space-y-6 lg:col-span-1">
            {/* Mana Symbol Bar */}
            <div className="p-4">
              <div className="grid grid-cols-6 gap-2">
                {manaColors.map(({ symbol, color, name }) => (
                  <button
                    key={symbol}
                    onClick={() => toggleMana(symbol)}
                    disabled={isLoading}
                    className={`
                      w-12 h-12 border-2 flex items-center justify-center p-1
                      transition-all duration-200 hover:scale-105 rounded-full
                      ${color}
                      ${selectedMana[symbol] ? `ring-4 ${manaColors.find((mc) => mc.symbol === symbol)?.ring} ring-opacity-50` : ""}
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
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
                      disabled={isLoading}
                      className={`w-5 h-5 border-2 border-black ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                    <label
                      htmlFor={packageName}
                      className={`text-xl font-semibold cursor-pointer select-none ${isLoading ? "opacity-50" : ""}`}
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

          {/* Column 2 - Takes 2/3 width */}
          <div className="space-y-4 flex flex-col h-full lg:col-span-2">
            {/* Input Fields */}
            <div className="space-y-3 flex-shrink-0">
              <div>
                <label
                  htmlFor="commanderName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Commander Name
                </label>
                <input
                  type="text"
                  id="commanderName"
                  value={commanderName}
                  onChange={(e) => setCommanderName(e.target.value)}
                  onBlur={handleCommanderNameBlur}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label
                  htmlFor="deckName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deck Name
                </label>
                <input
                  type="text"
                  id="deckName"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  onBlur={handleDeckNameBlur}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>

            {/* Export Preview Box */}
            <div className="flex-1 flex flex-col p-4 relative overflow-hidden">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold flex-shrink-0">
                  Export Preview
                </h2>
                {isLoading && (
                  <div className="ml-3 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Building deck...
                    </span>
                  </div>
                )}
              </div>
              <textarea
                value={exportText}
                onChange={(e) => setExportText(e.target.value)}
                disabled={isLoading}
                className={`flex-1 w-full p-2 border border-gray-300 resize-none font-mono text-sm pr-32 pb-20 ${isLoading ? "opacity-50" : ""}`}
                placeholder="Select colours and packages to preview deck list..."
              />

              {/* Export Button */}
              <div className="absolute bottom-4 right-4 flex flex-col items-end">
                <button
                  onClick={handleExport}
                  disabled={isLoading}
                  className={`px-6 py-2 border-2 border-black font-semibold text-lg transition-colors
                  ${
                    isLoading
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {isLoading ? "Building..." : "Export"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stapler
