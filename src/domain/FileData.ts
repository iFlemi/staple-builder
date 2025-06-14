import { CardCategory } from "@/domain/Card"

export type FileCategory = CardCategory | "package"

export type FileData = {
  fileName: string
  fileCategory: FileCategory
  fileContents: string //small files, should be ok to do this in memory
}
