export interface Course {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse?: string
    courseType?: string
    pricePaise: number
    priceUsdCents: number
    mangoId?: string
    refundable: boolean
}

export type Status = "loading" | "error" | "empty" | "success"
export type SortOption = "featured" | "price-asc" | "price-desc"

export interface SkillpathCoursesProps {
    accentColor?: string
    cardBorderRadius?: number
}
