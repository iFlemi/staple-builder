import { ColourCharacter } from "@/domain/Colour"

export type ManaColour = {
  symbol: ColourCharacter
  color: string
  ring: string
  name: string
}

export const ManaColours: ManaColour[] = [
  {
    symbol: "W",
    color: "bg-white border-yellow-400",
    ring: "ring-yellow-400",
    name: "White",
  },
  {
    symbol: "B",
    color: "bg-white border-gray-600",
    ring: "ring-gray-400",
    name: "Black",
  },
  {
    symbol: "R",
    color: "bg-white border-red-600",
    ring: "ring-red-400",
    name: "Red",
  },
  {
    symbol: "G",
    color: "bg-white border-green-600",
    ring: "ring-green-400",
    name: "Green",
  },
  {
    symbol: "U",
    color: "bg-white border-blue-600",
    ring: "ring-blue-400",
    name: "Blue",
  },
  {
    symbol: "C",
    color: "bg-white border-gray-400",
    ring: "ring-gray-400",
    name: "Colorless",
  },
]
