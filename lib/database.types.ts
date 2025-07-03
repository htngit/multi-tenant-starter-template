export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          credit_limit: number | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: number | null
          phone: string | null
          tax_number: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string | null
          id: string
          last_movement_at: string | null
          product_id: string | null
          quantity: number | null
          reserved_quantity: number | null
          team_id: string | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_movement_at?: string | null
          product_id?: string | null
          quantity?: number | null
          reserved_quantity?: number | null
          team_id?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_movement_at?: string | null
          product_id?: string | null
          quantity?: number | null
          reserved_quantity?: number | null
          team_id?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          selling_price: number | null
          sku: string
          team_id: string | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          selling_price?: number | null
          sku: string
          team_id?: string | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          selling_price?: number | null
          sku?: string
          team_id?: string | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          purchase_order_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          purchase_order_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: Database["public"]["Enums"]["document_status"] | null
          subtotal: number | null
          supplier_id: string | null
          tax_amount: number | null
          team_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date: string
          order_number: string
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          team_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          team_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_order_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          sales_order_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          sales_order_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          sales_order_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_items_sales_order_id_fkey"
            columns: ["sales_order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_orders: {
        Row: {
          created_at: string | null
          created_by: string
          customer_id: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: Database["public"]["Enums"]["document_status"] | null
          subtotal: number | null
          tax_amount: number | null
          team_id: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          customer_id?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date: string
          order_number: string
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          team_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          customer_id?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: Database["public"]["Enums"]["document_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          team_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_orders_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          product_id: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          team_id: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          team_id?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          product_id?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          team_id?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          payment_terms: number | null
          phone: string | null
          tax_number: string | null
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          payment_terms?: number | null
          phone?: string | null
          tax_number?: string | null
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_user_id: string | null
          name: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_user_id?: string | null
          name: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_user_id?: string | null
          name?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      document_status: "approved" | "cancelled" | "draft" | "pending" | "rejected"
      stock_movement_type: "adjustment" | "in" | "out" | "transfer"
      transaction_status: "cancelled" | "completed" | "failed" | "pending"
      user_role: "admin" | "manager" | "staff" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never