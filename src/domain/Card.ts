import { Colour } from "@/domain/Colour"

export type CardCategory = "uncommon" | "rare"

export type Card = {
  name: string
  //not handling actual rarity yet, just categorising by common/uncommon or rare/mythic.
  rarity: CardCategory //'C' | 'U' | 'R' | 'M'
  colourRequirement: Colour[]
}
