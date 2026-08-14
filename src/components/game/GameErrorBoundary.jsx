// Error Boundary — catches render crashes and shows a recovery screen
// instead of a blank white page. Save data is preserved.
import React from 'react';

export default class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GameErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReset = () => {
    const keys = ['starfarer_save_v1', 'starfarer_sandbox_v1', 'starfarer_active_save'];
    keys.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4" style={{ fontFamily: 'Courier New, monospace' }}>
            <div className="text-orange-500 text-2xl font-bold">
              ⚠ SYSTEM FAULT
            </div>
            <div className="text-orange-700 text-xs leading-relaxed">
              A critical error occurred while rendering the game interface.
              Your save data is preserved and intact.
            </div>
            <div className="text-red-500 text-[10px] border border-red-900 p-2 bg-red-950/20 break-words">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 border border-orange-500 text-orange-300 hover:bg-orange-950/30 text-xs font-bold"
              >
                ↻ RETRY
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 border border-red-700 text-red-400 hover:bg-red-950/30 text-xs font-bold"
              >
                RESET SAVE
              </button>
            </div>
            <div className="text-orange-800 text-[9px] pt-2">
              RETRY attempts to re-render without losing data. RESET clears the current save slot and restarts.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}