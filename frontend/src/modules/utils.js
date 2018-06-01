const isMobile = () => {
  return window.innerWidth < 768
}

const isTablet = () => {
  return window.innerWidth < 992 && window.innerWidth >= 768
}

const isDesktop = () => {
  return window.innerWidth >= 992
}

export {
  isMobile,
  isTablet,
  isDesktop
}
