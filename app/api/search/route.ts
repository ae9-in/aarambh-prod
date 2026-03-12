import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getAccessibleCategoryIdsForUser } from '@/lib/category-access'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const orgId = searchParams.get('orgId')
    const userId = searchParams.get('userId')
    const userRole = searchParams.get('userRole')

    if (!query || !orgId) {
      return NextResponse.json({ error: 'Missing query or orgId' }, { status: 400 })
    }

    let accessibleCategoryIds: string[] | null = null
    
    if (userId && userRole) {
      accessibleCategoryIds = await getAccessibleCategoryIdsForUser(orgId, userId, userRole)
      if (accessibleCategoryIds.length === 0) {
        return NextResponse.json(
          {
            query,
            groupedResults: [],
            flatResults: { categories: [], lessons: [] },
            totalResults: 0,
          },
          { status: 200 },
        )
      }
    }

    const searchTerm = `%${query.toLowerCase()}%`

    // Search categories
    let categoriesQuery = supabaseAdmin
      .from('categories')
      .select('id, name, description, icon, color, lesson_count')
      .eq('org_id', orgId)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)

    if (accessibleCategoryIds) {
      categoriesQuery = categoriesQuery.in('id', accessibleCategoryIds)
    }

    const { data: categories, error: catError } = await categoriesQuery

    if (catError) {
      console.error('Search categories error:', catError)
    }

    // Search content (lessons)
    let contentQuery = supabaseAdmin
      .from('content')
      .select('id, title, description, type, xp_reward, duration_minutes, category_id, category:category_id(name, color)')
      .eq('org_id', orgId)
      .eq('is_published', true)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)

    if (accessibleCategoryIds) {
      contentQuery = contentQuery.in('category_id', accessibleCategoryIds)
    }

    const { data: content, error: contentError } = await contentQuery

    if (contentError) {
      console.error('Search content error:', contentError)
    }

    // Group results by category
    const resultsByCategory: Record<string, any> = {}
    
    // Add matching categories
    ;(categories || []).forEach((cat) => {
      resultsByCategory[cat.id] = {
        category: cat,
        lessons: [],
      }
    })

    // Add matching lessons grouped by category
    ;(content || []).forEach((lesson: any) => {
      const catId = lesson.category_id
      if (!resultsByCategory[catId]) {
        resultsByCategory[catId] = {
          category: lesson.category || { name: 'Uncategorized', color: '#FF6B35' },
          lessons: [],
        }
      }
      resultsByCategory[catId].lessons.push(lesson)
    })

    // Convert to array and sort
    const groupedResults = Object.values(resultsByCategory).filter(
      (group: any) => group.lessons.length > 0 || categories?.find((c) => c.id === group.category.id)
    )

    // Also return flat results for simple lists
    const flatResults = {
      categories: categories || [],
      lessons: (content || []).map((l: any) => ({
        ...l,
        category_name: l.category?.name || 'Uncategorized',
        category_color: l.category?.color || '#FF6B35',
      })),
    }

    return NextResponse.json(
      {
        query,
        groupedResults,
        flatResults,
        totalResults: (categories?.length || 0) + (content?.length || 0),
      },
      { status: 200 }
    )
  } catch (e) {
    console.error('Search error:', e)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
