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
      adm_app: {
        Row: {
          code: string
          created_at: string | null
          id: string
          instance_id: string
          updated_at: string | null
        }
        Insert: {
          code?: string
          created_at?: string | null
          id?: string
          instance_id?: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          instance_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      adm_organization: {
        Row: {
          app_code: string
          app_id: string
          created_at: string | null
          id: string
          is_production: boolean
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          app_code?: string
          app_id?: string
          created_at?: string | null
          id?: string
          is_production?: boolean
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Update: {
          app_code?: string
          app_id?: string
          created_at?: string | null
          id?: string
          is_production?: boolean
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_app_code_fkey"
            columns: ["app_code"]
            isOneToOne: false
            referencedRelation: "adm_app"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "organization_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "adm_app"
            referencedColumns: ["id"]
          },
        ]
      }
      adm_user: {
        Row: {
          app_code: string
          app_id: string
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_production: boolean
          last_name: string
          updated_at: string | null
        }
        Insert: {
          app_code?: string
          app_id?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_production?: boolean
          last_name?: string
          updated_at?: string | null
        }
        Update: {
          app_code?: string
          app_id?: string
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_production?: boolean
          last_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_app_code_fkey"
            columns: ["app_code"]
            isOneToOne: false
            referencedRelation: "adm_app"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "user_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "adm_app"
            referencedColumns: ["id"]
          },
        ]
      }
      st_character: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          image: string
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          image?: string
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_character_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "adm_organization"
            referencedColumns: ["id"]
          },
        ]
      }
      st_flow_edge: {
        Row: {
          created_at: string | null
          data: Json | null
          flow_sheet_id: string | null
          id: string
          organization_id: string
          source: string
          source_handle: string
          target: string
          target_handle: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          flow_sheet_id?: string | null
          id?: string
          organization_id: string
          source: string
          source_handle: string
          target: string
          target_handle: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          flow_sheet_id?: string | null
          id?: string
          organization_id?: string
          source?: string
          source_handle?: string
          target?: string
          target_handle?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_flow_edge_flow_sheet_id_fkey"
            columns: ["flow_sheet_id"]
            isOneToOne: false
            referencedRelation: "st_flow_sheet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_flow_edge_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "adm_organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_flow_edge_source_fkey"
            columns: ["source"]
            isOneToOne: false
            referencedRelation: "st_flow_node"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_flow_edge_target_fkey"
            columns: ["target"]
            isOneToOne: false
            referencedRelation: "st_flow_node"
            referencedColumns: ["id"]
          },
        ]
      }
      st_flow_node: {
        Row: {
          created_at: string | null
          data: Json | null
          flow_sheet_id: string
          id: string
          organization_id: string
          position_x: number
          position_y: number
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          flow_sheet_id: string
          id?: string
          organization_id: string
          position_x: number
          position_y: number
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          flow_sheet_id?: string
          id?: string
          organization_id?: string
          position_x?: number
          position_y?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_flow_node_flow_sheet_id_fkey"
            columns: ["flow_sheet_id"]
            isOneToOne: false
            referencedRelation: "st_flow_sheet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_flow_node_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "adm_organization"
            referencedColumns: ["id"]
          },
        ]
      }
      st_flow_sheet: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_flow_sheet_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "adm_organization"
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
