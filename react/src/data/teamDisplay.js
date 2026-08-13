const rolePriority = [
  { rank: 1, pattern: /^president$/i },
  { rank: 2, pattern: /immediate\s+past\s+president/i },
  { rank: 3, pattern: /vice\s+president/i },
  { rank: 4, pattern: /executive\s+member|member/i },
]

function getRoleRank(position = '') {
  return rolePriority.find(({ pattern }) => pattern.test(position))?.rank || 99
}

export function sortTeamMembers(people) {
  return [...people].sort((left, right) => {
    const roleDifference = getRoleRank(left.position) - getRoleRank(right.position)
    if (roleDifference !== 0) return roleDifference

    const orderDifference = Number(left.display_order || 0) - Number(right.display_order || 0)
    if (orderDifference !== 0) return orderDifference

    return String(left.name || '').localeCompare(String(right.name || ''))
  })
}
