import { Colour } from "@/domain/Colour"
import { Option } from "prelude-ts"

export type Card = {
  name: string
  colourRequirement: Colour[]
  packageName: Option<string> //todo: type this?
}
