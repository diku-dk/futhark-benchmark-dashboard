import fetch from '../modules/fetch'

export const fetchDashboard = () => fetch('HOME_DASHBOARD', 'dashboard.json', state => {
  return state.data.bottomScores.length > 0
})
