export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const STATUS_MAP = {
  [ORDER_STATUS.PENDING]: { text: '待处理', class: 'pending' },
  [ORDER_STATUS.PROCESSING]: { text: '处理中', class: 'processing' },
  [ORDER_STATUS.COMPLETED]: { text: '已完成', class: 'completed' },
  [ORDER_STATUS.CANCELLED]: { text: '已取消', class: 'cancelled' }
} 