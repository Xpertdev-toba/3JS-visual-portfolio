import { Experience } from './Experience/Experience.js'

/**
 * Portfolio 3JS - Interactive 3D Portfolio
 * Production-ready with comprehensive error handling
 */

// Helper: show error on page
function showError(msg) {
  let el = document.getElementById('_err_overlay')
  if (!el) {
    el = document.createElement('pre')
    el.id = '_err_overlay'
    el.style.cssText = 'position:fixed;top:10px;left:10px;z-index:99999;background:rgba(200,0,0,0.9);color:white;padding:12px 16px;font-size:12px;max-width:80vw;max-height:50vh;overflow:auto;word-wrap:break-word;border-radius:8px;font-family:monospace;'
    document.body.appendChild(el)
  }
  el.textContent += msg + '\n'
}

// Helper: force hide loading screen
function forceHideLoading() {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen) {
    loadingScreen.style.transition = 'opacity 0.3s'
    loadingScreen.style.opacity = '0'
    loadingScreen.style.pointerEvents = 'none'
    setTimeout(() => {
      loadingScreen.style.display = 'none'
    }, 300)
  }
}

// Catch all unhandled errors
window.addEventListener('error', (e) => {
  const msg = `❌ ${e.message}\n   ${e.filename}:${e.lineno}`
  console.error(msg)
  showError(msg)
  forceHideLoading()
})
window.addEventListener('unhandledrejection', (e) => {
  const msg = `❌ Unhandled rejection: ${e.reason}`
  console.error(msg)
  showError(msg)
  forceHideLoading()
})

// Failsafe: force hide loading screen after 8 seconds no matter what
// This prevents infinite loading states
setTimeout(() => {
  const loadingScreen = document.getElementById('loading-screen')
  if (loadingScreen && loadingScreen.style.display !== 'none') {
    console.warn('⚠️ Failsafe: forcing loading screen hide after timeout')
    forceHideLoading()
  }
}, 8000)

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOMContentLoaded - starting Experience...')
  
  try {
    const canvas = document.getElementById('webgl')
    if (!canvas) {
      showError('❌ Canvas element #webgl not found in DOM!')
      forceHideLoading()
      return
    }

    console.log('📦 Creating Experience instance...')
    const experience = new Experience({ canvas })
    console.log('✅ Experience created successfully')

    if (import.meta.env.DEV) {
      window.experience = experience
    }
  } catch (err) {
    console.error('❌ Experience init failed:', err)
    showError('❌ Experience init failed: ' + err.message + '\n' + err.stack)
    forceHideLoading()
  }
})
