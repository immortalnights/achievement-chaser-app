import { gql } from 'graphql-request';
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
