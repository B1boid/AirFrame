export const AZURO_QUERY = `query Games($where: Game_filter!) {
  games(
    first: 1000
    where: $where
    subgraphError: allow
    orderBy: startsAt
    orderDirection: asc
  ) {
    gameId
    slug
    startsAt
    league {
      name
      slug
      country {
        name
        slug
      }
    }
    sport {
      name
      slug
    }
    participants {
      image
      name
    }
    conditions {
      conditionId
      isExpressForbidden
      status
      outcomes {
        currentOdds
        outcomeId
      }
    }
  }
}`

export interface Odd {
    outcomeId: string
    odd: number
}

export interface Condition {
    conditionId: string
    fee: number
    odds: Odd[]
}

export interface Match {
    slug: string
    sport: string
    time: number
    conditions: {[key: string]: Condition}
}

export interface AzuroBet {
    amount: number
    odd: number
    condId: string
    outcomeId: string
}
