// This is a placeholder file for the Supabase database types
// The actual types will be generated using the supabase gen types command

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          order_number: string;
          amount: number;
          source: string;
          status: string;
          payment_method: string;
          table_number?: string;
          order_type: string;
          user_id?: string;
          created_by: string;
          created_at?: string;
          customer_name?: string;
          void_reason?: string;
          voided_at?: string;
          refund_reason?: string;
          refunded_at?: string;
          refund_amount?: number;
        };
        Insert: {
          id?: string;
          order_number: string;
          amount: number;
          source: string;
          status: string;
          payment_method: string;
          table_number?: string;
          order_type: string;
          user_id?: string;
          created_by: string;
          created_at?: string;
          customer_name?: string;
          void_reason?: string;
          voided_at?: string;
          refund_reason?: string;
          refunded_at?: string;
          refund_amount?: number;
        };
        Update: {
          id?: string;
          order_number?: string;
          amount?: number;
          source?: string;
          status?: string;
          payment_method?: string;
          table_number?: string;
          order_type?: string;
          user_id?: string;
          created_by?: string;
          created_at?: string;
          customer_name?: string;
          void_reason?: string;
          voided_at?: string;
          refund_reason?: string;
          refunded_at?: string;
          refund_amount?: number;
        };
      };
      transaction_items: {
        Row: {
          id: string;
          transaction_id: string;
          name: string;
          quantity: number;
          price: number;
          type?: string;
          customizations?: any;
          created_at?: string;
        };
        Insert: {
          id?: string;
          transaction_id: string;
          name: string;
          quantity: number;
          price: number;
          type?: string;
          customizations?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          transaction_id?: string;
          name?: string;
          quantity?: number;
          price?: number;
          type?: string;
          customizations?: any;
          created_at?: string;
        };
      };
      devices: {
        Row: {
          id: string;
          name: string;
          type: string;
          status: string;
          ip_address?: string;
          location?: string;
          last_seen?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          status: string;
          ip_address?: string;
          location?: string;
          last_seen?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          status?: string;
          ip_address?: string;
          location?: string;
          last_seen?: string;
          created_at?: string;
        };
      };
    };
  };
};
