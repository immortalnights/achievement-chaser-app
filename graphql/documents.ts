import { gql } from "graphql-request"
// Place to define and export GraphQL queries, mutations, and fragments

// Example:
// export const GET_ACHIEVEMENTS = `
//   query GetAchievements($date: String!, $steamId: String!) {
//     achievements(date: $date, steamId: $steamId) {
//       id
//       name
//       description
//       iconUrl
//     }
//   }
// `;

// Add your GraphQL documents below
export const searchPlayers = gql`
  query Search($name: String!) {
    player(name: $name) {
      id
      name
      avatarMediumUrl
    }
  }
`

export const playerProfile = gql`
  query PlayerProfile($player: BigInt!) {
    player(id: $player) {
      id
      name
      avatarLargeUrl
      profileUrl
      profile {
        ownedGames
        perfectGames
        playedGames
        totalPlaytime
        lockedAchievements
        unlockedAchievements
      }
    }
  }
`

export const playerGames = gql`
  query PlayerGames($player: BigInt!, $started: Boolean, $incomplete: Boolean, $orderBy: String, $limit: Int) {
    player(id: $player) {
      id
      games(started: $started, completed_Isnull: $incomplete, orderBy: $orderBy, first: $limit) {
        edges {
          node {
            game {
              id
              name
              imgIconUrl
              achievementCount
              difficultyPercentage
            }
            lastPlayed
            playtimeForever
            unlockedAchievementCount
            completed
          }
        }
      }
    }
  }
`

export const playerUnlockedAchievements = gql`
  query PlayerUnlockedAchievements(
    $player: BigInt!
    $game: Int
    $year: Decimal
    $range: [DateTime]
    $orderBy: String
    $limit: Int
    $cursor: String
  ) {
    player(id: $player) {
      id
      unlockedAchievements(
        game: $game
        year: $year
        datetime_Range: $range
        orderBy: $orderBy
        first: $limit
        after: $cursor
      ) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
          startCursor
        }
        edges {
          node {
            id
            datetime
            playtime
            game {
              id
              name
              imgIconUrl
              achievementCount
              difficultyPercentage
            }
            achievement {
              id
              displayName
              description
              iconUrl
              iconGrayUrl
            }
          }
        }
      }
    }
  }
`
