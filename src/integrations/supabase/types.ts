export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bounty_completions: {
        Row: {
          bounty_id: string
          completed_at: string
          completed_by: string
          completion_proof: string
          completion_url: string | null
          created_at: string
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          bounty_id: string
          completed_at?: string
          completed_by: string
          completion_proof: string
          completion_url?: string | null
          created_at?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          bounty_id?: string
          completed_at?: string
          completed_by?: string
          completion_proof?: string
          completion_url?: string | null
          created_at?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bounty_completions_bounty_id_fkey"
            columns: ["bounty_id"]
            isOneToOne: false
            referencedRelation: "bug_bounties"
            referencedColumns: ["id"]
          },
        ]
      }
      bug_bounties: {
        Row: {
          claimed_by: string | null
          created_at: string
          description: string
          id: string
          project_id: string
          reward_amount: number
          severity: string
          status: string | null
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          claimed_by?: string | null
          created_at?: string
          description: string
          id?: string
          project_id: string
          reward_amount: number
          severity: string
          status?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          claimed_by?: string | null
          created_at?: string
          description?: string
          id?: string
          project_id?: string
          reward_amount?: number
          severity?: string
          status?: string | null
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bug_bounties_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          added_at: string
          id: string
          nft_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          nft_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          added_at?: string
          id?: string
          nft_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "marketplace_nfts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nft_mints"
            referencedColumns: ["id"]
          },
        ]
      }
      currency_deposits: {
        Row: {
          amount_naira: number
          amount_usd: number
          completed_at: string | null
          created_at: string
          deposit_method: string
          exchange_rate: number
          id: string
          status: string
          transaction_reference: string | null
          user_id: string
        }
        Insert: {
          amount_naira: number
          amount_usd: number
          completed_at?: string | null
          created_at?: string
          deposit_method?: string
          exchange_rate: number
          id?: string
          status?: string
          transaction_reference?: string | null
          user_id: string
        }
        Update: {
          amount_naira?: number
          amount_usd?: number
          completed_at?: string | null
          created_at?: string
          deposit_method?: string
          exchange_rate?: number
          id?: string
          status?: string
          transaction_reference?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_stats: {
        Row: {
          created_at: string
          id: string
          last_activity: string
          points: number
          success_rate: number
          total_nfts: number
          total_tests: number
          updated_at: string
          user_id: string
          weekly_points: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity?: string
          points?: number
          success_rate?: number
          total_nfts?: number
          total_tests?: number
          updated_at?: string
          user_id: string
          weekly_points?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_activity?: string
          points?: number
          success_rate?: number
          total_nfts?: number
          total_tests?: number
          updated_at?: string
          user_id?: string
          weekly_points?: number
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_claim_at: string
          started_at: string
          total_mined: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_claim_at?: string
          started_at?: string
          total_mined?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_claim_at?: string
          started_at?: string
          total_mined?: number
          user_id?: string
        }
        Relationships: []
      }
      nft_mints: {
        Row: {
          category: string | null
          contract_address: string | null
          created_at: string
          created_by_username: string | null
          creator_royalty: number | null
          current_edition: number | null
          current_owner_id: string | null
          description: string | null
          edition_size: number | null
          for_sale: boolean | null
          id: string
          image_url: string | null
          is_limited_edition: boolean | null
          metadata_url: string | null
          minted_at: string | null
          name: string
          network: string
          original_creator_id: string | null
          price: number | null
          status: string
          tags: string[] | null
          token_id: string | null
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          contract_address?: string | null
          created_at?: string
          created_by_username?: string | null
          creator_royalty?: number | null
          current_edition?: number | null
          current_owner_id?: string | null
          description?: string | null
          edition_size?: number | null
          for_sale?: boolean | null
          id?: string
          image_url?: string | null
          is_limited_edition?: boolean | null
          metadata_url?: string | null
          minted_at?: string | null
          name: string
          network?: string
          original_creator_id?: string | null
          price?: number | null
          status?: string
          tags?: string[] | null
          token_id?: string | null
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          contract_address?: string | null
          created_at?: string
          created_by_username?: string | null
          creator_royalty?: number | null
          current_edition?: number | null
          current_owner_id?: string | null
          description?: string | null
          edition_size?: number | null
          for_sale?: boolean | null
          id?: string
          image_url?: string | null
          is_limited_edition?: boolean | null
          metadata_url?: string | null
          minted_at?: string | null
          name?: string
          network?: string
          original_creator_id?: string | null
          price?: number | null
          status?: string
          tags?: string[] | null
          token_id?: string | null
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nft_sales: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: string
          nft_id: string
          price: number
          seller_id: string
          sold_at: string | null
          status: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          nft_id: string
          price: number
          seller_id: string
          sold_at?: string | null
          status?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          nft_id?: string
          price?: number
          seller_id?: string
          sold_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nft_sales_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "marketplace_nfts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nft_sales_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nft_mints"
            referencedColumns: ["id"]
          },
        ]
      }
      okdub_tokens: {
        Row: {
          created_at: string
          id: string
          staked_amount: number | null
          token_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          staked_amount?: number | null
          token_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          staked_amount?: number | null
          token_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_items: {
        Row: {
          id: string
          nft_id: string
          payment_id: string
          price: number
          quantity: number
        }
        Insert: {
          id?: string
          nft_id: string
          payment_id: string
          price: number
          quantity?: number
        }
        Update: {
          id?: string
          nft_id?: string
          payment_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_items_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "marketplace_nfts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_items_nft_id_fkey"
            columns: ["nft_id"]
            isOneToOne: false
            referencedRelation: "nft_mints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_items_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          is_primary: boolean
          method_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          is_primary?: boolean
          method_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          is_primary?: boolean
          method_type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          completed_at: string | null
          created_at: string
          currency: string
          flutterwave_reference: string | null
          id: string
          payment_data: Json | null
          payment_method: string
          solana_transaction_id: string | null
          solana_wallet_address: string | null
          status: string
          total_amount: number
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          flutterwave_reference?: string | null
          id?: string
          payment_data?: Json | null
          payment_method?: string
          solana_transaction_id?: string | null
          solana_wallet_address?: string | null
          status?: string
          total_amount: number
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          currency?: string
          flutterwave_reference?: string | null
          id?: string
          payment_data?: Json | null
          payment_method?: string
          solana_transaction_id?: string | null
          solana_wallet_address?: string | null
          status?: string
          total_amount?: number
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_user_id: string
          contract_address: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          network: string | null
          project_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          client_user_id: string
          contract_address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          network?: string | null
          project_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          client_user_id?: string
          contract_address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          network?: string | null
          project_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staking_positions: {
        Row: {
          amount_staked: number
          created_at: string
          current_value: number
          end_date: string
          id: string
          roi_percentage: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_staked: number
          created_at?: string
          current_value: number
          end_date: string
          id?: string
          roi_percentage?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_staked?: number
          created_at?: string
          current_value?: number
          end_date?: string
          id?: string
          roi_percentage?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string
          features: Json
          id: string
          name: string
          required_tokens: number
        }
        Insert: {
          created_at?: string
          features: Json
          id?: string
          name: string
          required_tokens: number
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          name?: string
          required_tokens?: number
        }
        Relationships: []
      }
      test_runs: {
        Row: {
          block_number: number | null
          completed_at: string | null
          created_at: string
          gas_used: number | null
          id: string
          network: string
          status: string
          test_type: string
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          block_number?: number | null
          completed_at?: string | null
          created_at?: string
          gas_used?: number | null
          id?: string
          network: string
          status?: string
          test_type: string
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          block_number?: number | null
          completed_at?: string | null
          created_at?: string
          gas_used?: number | null
          id?: string
          network?: string
          status?: string
          test_type?: string
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          points_amount: number | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points_amount?: number | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          points_amount?: number | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          cash_balance: number
          created_at: string
          id: string
          points_balance: number
          total_earned: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_balance?: number
          created_at?: string
          id?: string
          points_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_balance?: number
          created_at?: string
          id?: string
          points_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          started_at: string
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          started_at?: string
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          started_at?: string
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_auth: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          account_details: Json | null
          amount: number
          created_at: string
          flutterwave_reference: string | null
          id: string
          processed_at: string | null
          status: string
          user_id: string
          withdrawal_method: string
        }
        Insert: {
          account_details?: Json | null
          amount: number
          created_at?: string
          flutterwave_reference?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          user_id: string
          withdrawal_method?: string
        }
        Update: {
          account_details?: Json | null
          amount?: number
          created_at?: string
          flutterwave_reference?: string | null
          id?: string
          processed_at?: string | null
          status?: string
          user_id?: string
          withdrawal_method?: string
        }
        Relationships: []
      }
    }
    Views: {
      marketplace_nfts: {
        Row: {
          category: string | null
          contract_address: string | null
          created_at: string | null
          created_by_username: string | null
          creator_royalty: number | null
          current_edition: number | null
          current_owner_id: string | null
          description: string | null
          edition_size: number | null
          first_name: string | null
          for_sale: boolean | null
          id: string | null
          image_url: string | null
          is_limited_edition: boolean | null
          last_name: string | null
          metadata_url: string | null
          minted_at: string | null
          name: string | null
          network: string | null
          original_creator_id: string | null
          price: number | null
          status: string | null
          tags: string[] | null
          token_id: string | null
          tx_hash: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_staking_returns: {
        Args: { _user_id: string; _position_id: string }
        Returns: number
      }
      convert_points_to_cash: {
        Args: { _user_id: string; _points_amount: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
