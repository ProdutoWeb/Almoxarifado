export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      produtos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          unidade: string
          quantidade_estoque: number
          criado_em: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          unidade: string
          quantidade_estoque?: number
          criado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          unidade?: string
          quantidade_estoque?: number
          criado_em?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          id: string
          solicitante_nome: string
          solicitante_siape: string
          departamento: string
          status_geral: 'pendente' | 'processado'
          enviado: boolean
          criado_em: string
        }
        Insert: {
          id?: string
          solicitante_nome: string
          solicitante_siape: string
          departamento: string
          status_geral?: 'pendente' | 'processado'
          enviado?: boolean
          criado_em?: string
        }
        Update: {
          id?: string
          solicitante_nome?: string
          solicitante_siape?: string
          departamento?: string
          status_geral?: 'pendente' | 'processado'
          enviado?: boolean
          criado_em?: string
        }
        Relationships: []
      }
      itens_pedido: {
        Row: {
          id: string
          pedido_id: string
          produto_id: string
          quantidade_solicitada: number
          quantidade_atendida: number
          status: 'pendente' | 'atendido' | 'rejeitado'
        }
        Insert: {
          id?: string
          pedido_id: string
          produto_id: string
          quantidade_solicitada: number
          quantidade_atendida?: number
          status?: 'pendente' | 'atendido' | 'rejeitado'
        }
        Update: {
          id?: string
          pedido_id?: string
          produto_id?: string
          quantidade_solicitada?: number
          quantidade_atendida?: number
          status?: 'pendente' | 'atendido' | 'rejeitado'
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          }
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
