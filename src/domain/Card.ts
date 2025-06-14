import {Colour, Colourless} from "@/domain/Colour";

export type Card = {
    name: string,
    rarity: 'C' | 'U' | 'R' | 'M'
    colourRequirement: Colour[] | Colourless
}

