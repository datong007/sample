export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const STATUS_MAP = {
  [ORDER_STATUS.PENDING]: {
    text: '待处理',
    color: '#f59e0b'
  },
  [ORDER_STATUS.PROCESSING]: {
    text: '处理中',
    color: '#0ea5e9'
  },
  [ORDER_STATUS.COMPLETED]: {
    text: '已完成',
    color: '#22c55e'
  },
  [ORDER_STATUS.CANCELLED]: {
    text: '已取消',
    color: '#ef4444'
  }
} 