import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component {
  props: Props;
  state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by AgriNova ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem("agrigen_cached_state");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F4F0] flex items-center justify-center p-4 font-sans" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-[#064E3B]">تنبيه استعادة استقرار النظام</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                حدث خطأ عارض أثناء تحميل أحد المكونات. تم احتواء الخطأ تلقائياً لحماية بيانات مزرعتك.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-500 font-mono text-left break-all border border-gray-200">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-[#064E3B] hover:bg-[#053F30] text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة تنشيط لوحة التحكم</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
