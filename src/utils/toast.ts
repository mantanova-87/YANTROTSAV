import { toast, type ToastOptions } from 'react-toastify'

const defaultToastOptions: ToastOptions = {
  position: 'bottom-right',
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark',
}

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultToastOptions, ...options }),
  error: (message: string, options?: ToastOptions) =>
    toast.error(message, { ...defaultToastOptions, ...options }),
  info: (message: string, options?: ToastOptions) =>
    toast.info(message, { ...defaultToastOptions, ...options }),
  warning: (message: string, options?: ToastOptions) =>
    toast.warning(message, { ...defaultToastOptions, ...options }),
  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
}

export { toast }
