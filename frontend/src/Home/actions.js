import fetch from '../modules/fetch'

export const fetchDashboard = () => fetch('HOME_DASHBOARD', 'dashboard.json', state => {
  return state.home.bottomScores.length > 0
})
