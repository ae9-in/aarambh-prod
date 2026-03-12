import { TrainingAIChat } from "@/components/ui/training-ai-chat"

type AIChatPageProps = {
  searchParams: Promise<{
    categoryId?: string
    categoryName?: string
  }>
}

export default async function AIChatPage({ searchParams }: AIChatPageProps) {
  const params = await searchParams
  return (
    <div className="flex w-full">
      <TrainingAIChat
        categoryId={params.categoryId ?? null}
        categoryName={params.categoryName ?? null}
      />
    </div>
  )
}

