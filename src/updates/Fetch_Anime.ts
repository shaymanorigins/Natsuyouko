// Shoutout to calebmwelsh on Keggle for writing a python scraper. All credits to them, i only translated his code to ts

export const anilistAPI = <string>'https://graphql.anilist.co'

// GraphQL query to fetch anime data with all attributes
export const query = `query ($page: Int, $perPage: Int, $startDate: FuzzyDateInt, $endDate: FuzzyDateInt) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(type: ANIME, startDate_greater: $startDate, startDate_lesser: $endDate) {
      # Basic Info
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      type
      format
      status
      description
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      season
      seasonYear
      seasonInt
      episodes
      duration
      chapters
      volumes
      countryOfOrigin
      isLicensed
      source
      hashtag
      trailer {
        id
        site
        thumbnail
      }
      updatedAt
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage

      # Tags and Genres
      genres
      synonyms
      tags {
        id
        name
        description
        category
        rank
        isGeneralSpoiler
        isMediaSpoiler
        isAdult
      }

      # Stats and Scores
      averageScore
      meanScore
      popularity
      favourites
      trending
      rankings {
        id
        rank
        type
        format
        year
        season
        allTime
        context
      }

      # Status Flags
      isFavourite
      isAdult
      isLocked

      # External Info
      siteUrl
      externalLinks {
        id
        url
        site
        type
        language
        color
        icon
        notes
        isDisabled
      }
      streamingEpisodes {
        title
        thumbnail
        url
        site
      }

      # Related Media
      relations {
        edges {
          id
          relationType
          node {
            id
            title {
              romaji
              english
              native
            }
            type
            format
            status
          }
        }
      }

      # Characters
      characters {
        edges {
          id
          role

          node {
            id
            name {
              full
              native
              alternative
            }

            image {
              large
              medium
            }
          }

          voiceActors {
            id
            name {
              full
            }
            image {
              large
            }
          }
        }
      }

      # Staff
      staff {
        edges {
          id
          role
          node {
            id
            name {
              full
              native
            }
            languageV2
            image {
              large
              medium
            }
          }
        }
      }

      # Studios
      studios {
        edges {
          id
          isMain
          node {
            id
            name
            isAnimationStudio
          }
        }
      }

      # Airing Info
      nextAiringEpisode {
        id
        airingAt
        timeUntilAiring
        episode
        mediaId
      }
      airingSchedule {
        nodes {
          id
          airingAt
          timeUntilAiring
          episode
          mediaId
        }
      }

      # Recommendations
      recommendations {
        edges {
          node {
            id
            rating
            mediaRecommendation {
              id
              title {
                romaji
                english
                native
              }
            }
          }
        }
      }

      # Reviews
      reviews {
        edges {
          node {
            id
            summary
            rating
            score
          }
        }
      }

      # Stats
      stats {
        scoreDistribution {
          score
          amount
        }
        statusDistribution {
          status
          amount
        }
      }
    }
  }
}`

export type Anime = {
  id: number
  idMal: number
  title: {
    romaji: string
    english: string
    native: string
    userPreferred: string
  }
  type: string
  format: string
  status: string
  description: string
  startDate: {
    year: number
    month: number
    day: number
  }
  endDate: {
    year: number
    month: number
    day: number
  }
  season: string
  seasonYear: number
  seasonInt: number
  episodes: number
  duration: number
  chapters: number
  volumes: number
  countryOfOrigin: string
  isLicensed: string
  source: string
  hashtag: string
  trailer: {
    id: number
    site: string
    thumbnail: string
  }
  updatedAt: number
  coverImage: {
    extraLarge: string
    large: string
    medium: string
    color: string
  }
  bannerImage: string
  genres: Array<string>
  synonyms: Array<string>
  tags: Array<string>
  averageScore: number
  meanScore: number
  popularity: number
  favourites: number
  trending: number
  rankings: Array<unknown>
  isFavourite: string
  isAdult: string
  isLocked: string
  siteUrl: string
  externalLinks: Array<string>
  streamingEpisodes: Array<unknown>
  relations: Array<unknown>
  characters: Array<unknown>
  staff: Array<unknown>
  studios: Array<unknown>
  nextAiringEpisode: Array<unknown>
  airingSchedule: Array<unknown>
  recommendations: Array<unknown>
  reviews: Array<unknown>
  stats: {
    scoreDistribution: Array<unknown>
    statusDistribution: Array<unknown>
  }
}

// Converts year, month, day to FuzzyDateInt format required by AniList API
export function convert_to_fuzzy_date(year: number, month = 1, day = 1): number {
  return year * 10000 + month * 100 + day
}

export async function fetch_anime_page(
  page: number,
  per_page = 50,
  start_year: number,
  end_year: number,
) {
  // Convert years to FuzzyDateInt format
  const start_date = start_year ? convert_to_fuzzy_date(start_year, 1, 1) : null
  const end_date = end_year ? convert_to_fuzzy_date(end_year, 12, 31) : null

  const variables = {
    page: page,
    perPage: per_page,
    startDate: start_date,
    endDate: end_date,
  }

  const payload = {
    query: query,
    variables: variables,
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  try {
    const response = await fetch(anilistAPI, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    })

    // Handle rate limiting
    if (response.status == 429) {
      const retry_after_header = response.headers.get('Retry-After')
      const retry_after = retry_after_header ? Number(retry_after_header) : 60
      await new Promise((resolve) => setTimeout(resolve, retry_after * 1000))
      return fetch_anime_page(page, per_page, start_year, end_year)
    }

    // Handle other errors
    if (response.status != 200) {
      return false
    }

    return await response.json()
  } catch {
    return false
  }
}

export function flatten_anime_data(anime: Anime) {
  const flattened: unknown[] = []
  const title = anime.title
  const startDate = anime.startDate ?? {}
  const endDate = anime.endDate ?? {}
  const trailer = anime.trailer ?? {}
  const coverImage = anime.coverImage ?? {}
  const stats = anime.stats ?? {}

  flattened.push(
    // Basic info
    anime.id,
    anime.idMal,

    // Title
    title.romaji,
    title.english,
    title.native,
    title.userPreferred,

    // Basic attributes
    anime.type,
    anime.format,
    anime.status,
    anime.description,

    // Dates
    startDate.year,
    startDate.month,
    startDate.day,

    endDate.year,
    endDate.month,
    endDate.day,

    // Season info
    anime.season,
    anime.seasonYear,
    anime.seasonInt,

    // Episode info
    anime.episodes,
    anime.duration,
    anime.chapters,
    anime.volumes,

    // Origin and source
    anime.countryOfOrigin,
    anime.isLicensed,
    anime.source,
    anime.hashtag,

    // Trailer
    trailer?.id ?? null,
    trailer?.site,
    trailer?.thumbnail,

    // Updated timestamp
    anime.updatedAt,

    // Images
    coverImage.extraLarge,
    coverImage.large,
    coverImage.medium,
    coverImage.color,
    anime.bannerImage,

    // Tags and genres
    JSON.stringify(anime.genres ?? []),
    JSON.stringify(anime.synonyms ?? []),

    // Covert tags to JSON
    JSON.stringify(anime.tags ?? []),

    // Stats and scores
    anime.averageScore,
    anime.meanScore,
    anime.popularity,
    anime.favourites,
    anime.trending,

    // Rankings
    JSON.stringify(anime.rankings ?? []),

    // Status flags
    anime.isFavourite,
    anime.isAdult,
    anime.isLocked,

    // External info
    anime.siteUrl,

    // External links
    JSON.stringify(anime.externalLinks ?? []),

    // Streaming episodes
    JSON.stringify(anime.streamingEpisodes ?? []),

    // Relations
    JSON.stringify(anime.relations ?? []),

    // Characters
    JSON.stringify(anime.characters ?? []),

    // Staff
    JSON.stringify(anime.staff ?? []),

    // Studios
    JSON.stringify(anime.studios ?? []),

    // Airing info
    JSON.stringify(anime.nextAiringEpisode ?? []),
    JSON.stringify(anime.airingSchedule ?? []),

    // Recommendations
    JSON.stringify(anime.recommendations ?? []),

    // Reviews
    JSON.stringify(anime.reviews ?? []),

    // Stats
    JSON.stringify(stats.scoreDistribution ?? []),
    JSON.stringify(stats.statusDistribution ?? []),
  )

  return flattened
}

export async function fetch_all_anime(test_mode = false): Promise<Anime[]> {
  let year_ranges: [number, number][] = []

  if (test_mode) {
    year_ranges = [[2020, 2020]]
  } else {
    year_ranges = [
      [1940, 1965], // Very early anime (few entries)
      [1966, 1970],
      [1971, 1975],
      [1976, 1980], // Older anime
      [1981, 1985],
      [1986, 1990],
      [1991, 1995],
      [1996, 2000], // Classic anime
      [2001, 2005],
      [2006, 2007],
      [2008, 2009], // More anime per year
      [2010, 2011],
      [2012, 2013],
      [2014, 2015], // Modern anime (many entries)
      [2016, 2016],
      [2017, 2017],
      [2018, 2018], // Recent anime (many entries per year)
      [2019, 2019],
      [2020, 2020],
      [2021, 2021], // Very recent anime
      [2022, 2022],
      [2023, 2023],
      [2024, 2024], // Current anime
      [2025, 2025],
      [2026, 2026], // Upcoming anime
    ]
  }

  const all_anime: Anime[] = []

  for (const [start_year, end_year] of year_ranges) {
    const anime_batch: Anime[] = []
    let page = 1
    let has_next_page = true

    while (has_next_page) {
      const response = await fetch_anime_page(page, 50, start_year, end_year)

      if (!response || !('data' in response)) {
        break
      }

      const page_info = response.data.Page.pageInfo
      const media_list = response.data.Page.media as Anime[]

      for (const anime of media_list) {
        // const flattened_anime = flatten_anime_data(anime)
        anime_batch.push(anime)
      }

      has_next_page = page_info.hasNextPage
      page += 1

      if (test_mode && page > 2) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 750))
    }
    if (anime_batch) {
      all_anime.push(...anime_batch)
    }
  }

  return all_anime
}
