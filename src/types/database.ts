export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  private: {
    Tables: {
      exercise_answer_keys: {
        Row: {
          case_sensitive: boolean;
          created_at: string;
          explanation_markdown: string;
          question_id: string;
          updated_at: string;
        };
        Insert: {
          case_sensitive?: boolean;
          created_at?: string;
          explanation_markdown: string;
          question_id: string;
          updated_at?: string;
        };
        Update: {
          case_sensitive?: boolean;
          created_at?: string;
          explanation_markdown?: string;
          question_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_correct_options: {
        Row: {
          created_at: string;
          option_id: string;
          question_id: string;
        };
        Insert: {
          created_at?: string;
          option_id: string;
          question_id: string;
        };
        Update: {
          created_at?: string;
          option_id?: string;
          question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_correct_options_key_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "exercise_answer_keys";
            referencedColumns: ["question_id"];
          },
        ];
      };
      exercise_correct_text_answers: {
        Row: {
          answer_text: string;
          created_at: string;
          normalized_answer: string;
          question_id: string;
        };
        Insert: {
          answer_text: string;
          created_at?: string;
          normalized_answer: string;
          question_id: string;
        };
        Update: {
          answer_text?: string;
          created_at?: string;
          normalized_answer?: string;
          question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_correct_text_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "exercise_answer_keys";
            referencedColumns: ["question_id"];
          },
        ];
      };
      listening_transcripts: {
        Row: {
          audio_asset_id: string;
          created_at: string;
          transcript_markdown: string;
          updated_at: string;
        };
        Insert: {
          audio_asset_id: string;
          created_at?: string;
          transcript_markdown: string;
          updated_at?: string;
        };
        Update: {
          audio_asset_id?: string;
          created_at?: string;
          transcript_markdown?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      completed_learner_exists: { Args: never; Returns: boolean };
      count_writing_words: { Args: { input_text: string }; Returns: number };
      exercise_set_is_accessible: {
        Args: { target_set_id: string };
        Returns: boolean;
      };
      exercise_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
      exercise_version_status_for_question: {
        Args: { target_question_id: string };
        Returns: string;
      };
      grammar_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
      lesson_is_accessible: {
        Args: { target_lesson_id: string };
        Returns: boolean;
      };
      lesson_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
      listening_audio_is_accessible: {
        Args: { target_audio_id: string };
        Returns: boolean;
      };
      listening_part_is_accessible: {
        Args: { target_part_id: string };
        Returns: boolean;
      };
      listening_practice_version_is_accessible: {
        Args: { target_exercise_version_id: string };
        Returns: boolean;
      };
      mock_test_is_accessible: {
        Args: { target_test_id: string };
        Returns: boolean;
      };
      mock_test_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
      module_is_accessible: {
        Args: { target_module_id: string };
        Returns: boolean;
      };
      normalize_exact_answer: {
        Args: { case_sensitive: boolean; value: string };
        Returns: string;
      };
      question_is_accessible: {
        Args: { target_question_id: string };
        Returns: boolean;
      };
      reading_passage_is_accessible: {
        Args: { target_passage_id: string };
        Returns: boolean;
      };
      reading_passage_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
      reading_practice_version_is_accessible: {
        Args: { target_exercise_version_id: string };
        Returns: boolean;
      };
      reading_question_group_is_accessible: {
        Args: { target_group_id: string };
        Returns: boolean;
      };
      reading_section_is_accessible: {
        Args: { target_section_id: string };
        Returns: boolean;
      };
      section_is_accessible: {
        Args: { target_section_id: string };
        Returns: boolean;
      };
      speaking_set_is_accessible: {
        Args: { target_set_id: string };
        Returns: boolean;
      };
      speaking_set_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
      speaking_signing_secret: { Args: never; Returns: string };
      speaking_upload_expected_signature: {
        Args: {
          actor_id: string;
          checksum: string;
          duration_seconds: number;
          expires_at: string;
          intent_id: string;
          mime_type: string;
          size_bytes: number;
        };
        Returns: string;
      };
      speaking_upload_signature_message: {
        Args: {
          actor_id: string;
          checksum: string;
          duration_seconds: number;
          expires_at: string;
          intent_id: string;
          mime_type: string;
          size_bytes: number;
        };
        Returns: string;
      };
      valid_writing_band: { Args: { value: number }; Returns: boolean };
      vocabulary_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
      writing_feedback_evidence_is_valid: {
        Args: { essay: string; feedback_payload: Json };
        Returns: boolean;
      };
      writing_signing_secret: { Args: never; Returns: string };
      writing_task_is_accessible: {
        Args: { target_task_id: string };
        Returns: boolean;
      };
      writing_task_version_is_accessible: {
        Args: { target_version_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      vocabulary_vault: {
        Row: { id: string; user_id: string; term: string; created_at: string };
        Insert: {
          id?: string;
          user_id: string;
          term: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          term?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: "in_progress" | "completed";
          last_position_seconds: number;
          completion_percentage: number;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          status?: "in_progress" | "completed";
          last_position_seconds?: number;
          completion_percentage?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          status?: "in_progress" | "completed";
          last_position_seconds?: number;
          completion_percentage?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_attempts: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          status: "in_progress" | "submitted" | "abandoned";
          draft_answers: Json;
          started_at: string;
          server_expires_at: string | null;
          submitted_at: string | null;
          score: number;
          max_score: number;
          accuracy_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          status?: "in_progress" | "submitted" | "abandoned";
          draft_answers?: Json;
          started_at?: string;
          server_expires_at?: string | null;
          submitted_at?: string | null;
          score?: number;
          max_score?: number;
          accuracy_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          status?: "in_progress" | "submitted" | "abandoned";
          draft_answers?: Json;
          started_at?: string;
          server_expires_at?: string | null;
          submitted_at?: string | null;
          score?: number;
          max_score?: number;
          accuracy_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercise_options: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          position: number;
          question_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          position: number;
          question_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          position?: number;
          question_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_options_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "exercise_questions";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_questions: {
        Row: {
          created_at: string;
          exercise_set_version_id: string;
          id: string;
          listening_part_id: string | null;
          points: number;
          position: number;
          prompt_markdown: string;
          question_type: string;
          reading_question_group_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          exercise_set_version_id: string;
          id?: string;
          listening_part_id?: string | null;
          points?: number;
          position: number;
          prompt_markdown: string;
          question_type: string;
          reading_question_group_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          exercise_set_version_id?: string;
          id?: string;
          listening_part_id?: string | null;
          points?: number;
          position?: number;
          prompt_markdown?: string;
          question_type?: string;
          reading_question_group_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_questions_exercise_set_version_id_fkey";
            columns: ["exercise_set_version_id"];
            isOneToOne: false;
            referencedRelation: "exercise_set_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "exercise_questions_listening_part_fkey";
            columns: ["exercise_set_version_id", "listening_part_id"];
            isOneToOne: false;
            referencedRelation: "listening_parts";
            referencedColumns: ["exercise_set_version_id", "id"];
          },
          {
            foreignKeyName: "exercise_questions_reading_group_fkey";
            columns: ["exercise_set_version_id", "reading_question_group_id"];
            isOneToOne: false;
            referencedRelation: "reading_question_groups";
            referencedColumns: ["exercise_set_version_id", "id"];
          },
        ];
      };
      exercise_set_versions: {
        Row: {
          allow_review: boolean;
          archived_at: string | null;
          created_at: string;
          difficulty: string;
          exercise_set_id: string;
          id: string;
          instructions_markdown: string;
          published_at: string | null;
          status: string;
          summary: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          allow_review?: boolean;
          archived_at?: string | null;
          created_at?: string;
          difficulty: string;
          exercise_set_id: string;
          id?: string;
          instructions_markdown: string;
          published_at?: string | null;
          status?: string;
          summary: string;
          title: string;
          updated_at?: string;
          version: number;
        };
        Update: {
          allow_review?: boolean;
          archived_at?: string | null;
          created_at?: string;
          difficulty?: string;
          exercise_set_id?: string;
          id?: string;
          instructions_markdown?: string;
          published_at?: string | null;
          status?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_set_versions_exercise_set_id_fkey";
            columns: ["exercise_set_id"];
            isOneToOne: false;
            referencedRelation: "exercise_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_sets: {
        Row: {
          created_at: string;
          display_order: number;
          domain: string;
          id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order: number;
          domain: string;
          id?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          domain?: string;
          id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      grammar_topic_versions: {
        Row: {
          archived_at: string | null;
          common_mistakes: Json;
          created_at: string;
          difficulty: string;
          examples: Json;
          explanation_markdown: string;
          grammar_topic_id: string;
          id: string;
          licence: string;
          published_at: string | null;
          related_exercise_set_id: string | null;
          source_name: string;
          status: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          common_mistakes: Json;
          created_at?: string;
          difficulty: string;
          examples: Json;
          explanation_markdown: string;
          grammar_topic_id: string;
          id?: string;
          licence?: string;
          published_at?: string | null;
          related_exercise_set_id?: string | null;
          source_name?: string;
          status?: string;
          title: string;
          updated_at?: string;
          version: number;
        };
        Update: {
          archived_at?: string | null;
          common_mistakes?: Json;
          created_at?: string;
          difficulty?: string;
          examples?: Json;
          explanation_markdown?: string;
          grammar_topic_id?: string;
          id?: string;
          licence?: string;
          published_at?: string | null;
          related_exercise_set_id?: string | null;
          source_name?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "grammar_topic_versions_grammar_topic_id_fkey";
            columns: ["grammar_topic_id"];
            isOneToOne: false;
            referencedRelation: "grammar_topics";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grammar_topic_versions_related_exercise_set_id_fkey";
            columns: ["related_exercise_set_id"];
            isOneToOne: false;
            referencedRelation: "exercise_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      grammar_topics: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order: number;
          id?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learner_answer_options: {
        Row: {
          answer_id: string;
          attempt_id: string;
          created_at: string;
          option_id: string;
          question_id: string;
        };
        Insert: {
          answer_id: string;
          attempt_id: string;
          created_at?: string;
          option_id: string;
          question_id: string;
        };
        Update: {
          answer_id?: string;
          attempt_id?: string;
          created_at?: string;
          option_id?: string;
          question_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_answer_options_answer_fkey";
            columns: ["attempt_id", "question_id", "answer_id"];
            isOneToOne: false;
            referencedRelation: "learner_answers";
            referencedColumns: ["attempt_id", "question_id", "id"];
          },
          {
            foreignKeyName: "learner_answer_options_option_fkey";
            columns: ["question_id", "option_id"];
            isOneToOne: false;
            referencedRelation: "exercise_options";
            referencedColumns: ["question_id", "id"];
          },
        ];
      };
      learner_answers: {
        Row: {
          answer_text: string | null;
          attempt_id: string;
          awarded_points: number | null;
          client_revision: number;
          created_at: string;
          exercise_set_version_id: string;
          finalized_at: string | null;
          id: string;
          is_correct: boolean | null;
          question_id: string;
          saved_at: string;
          updated_at: string;
        };
        Insert: {
          answer_text?: string | null;
          attempt_id: string;
          awarded_points?: number | null;
          client_revision: number;
          created_at?: string;
          exercise_set_version_id: string;
          finalized_at?: string | null;
          id?: string;
          is_correct?: boolean | null;
          question_id: string;
          saved_at?: string;
          updated_at?: string;
        };
        Update: {
          answer_text?: string | null;
          attempt_id?: string;
          awarded_points?: number | null;
          client_revision?: number;
          created_at?: string;
          exercise_set_version_id?: string;
          finalized_at?: string | null;
          id?: string;
          is_correct?: boolean | null;
          question_id?: string;
          saved_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_answers_attempt_version_fkey";
            columns: ["attempt_id", "exercise_set_version_id"];
            isOneToOne: false;
            referencedRelation: "learner_attempts";
            referencedColumns: ["id", "exercise_set_version_id"];
          },
          {
            foreignKeyName: "learner_answers_question_version_fkey";
            columns: ["exercise_set_version_id", "question_id"];
            isOneToOne: false;
            referencedRelation: "exercise_questions";
            referencedColumns: ["exercise_set_version_id", "id"];
          },
        ];
      };
      learner_attempts: {
        Row: {
          created_at: string;
          current_question_position: number;
          exercise_set_id: string;
          exercise_set_version_id: string;
          expires_at: string | null;
          id: string;
          is_mock: boolean;
          last_saved_at: string;
          max_score: number | null;
          reading_time_limit_seconds: number | null;
          score: number | null;
          scored_at: string | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submitted_at: string | null;
          time_limit_seconds: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_question_position?: number;
          exercise_set_id: string;
          exercise_set_version_id: string;
          expires_at?: string | null;
          id?: string;
          is_mock?: boolean;
          last_saved_at?: string;
          max_score?: number | null;
          reading_time_limit_seconds?: number | null;
          score?: number | null;
          scored_at?: string | null;
          start_idempotency_key: string;
          started_at?: string;
          status?: string;
          submitted_at?: string | null;
          time_limit_seconds?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_question_position?: number;
          exercise_set_id?: string;
          exercise_set_version_id?: string;
          expires_at?: string | null;
          id?: string;
          is_mock?: boolean;
          last_saved_at?: string;
          max_score?: number | null;
          reading_time_limit_seconds?: number | null;
          score?: number | null;
          scored_at?: string | null;
          start_idempotency_key?: string;
          started_at?: string;
          status?: string;
          submitted_at?: string | null;
          time_limit_seconds?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_attempts_exercise_set_id_fkey";
            columns: ["exercise_set_id"];
            isOneToOne: false;
            referencedRelation: "exercise_sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learner_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learner_attempts_version_fkey";
            columns: ["exercise_set_id", "exercise_set_version_id"];
            isOneToOne: false;
            referencedRelation: "exercise_set_versions";
            referencedColumns: ["exercise_set_id", "id"];
          },
        ];
      };
      learner_lesson_progress: {
        Row: {
          completed_at: string | null;
          created_at: string;
          current_section_id: string | null;
          last_accessed_at: string;
          lesson_id: string;
          lesson_version_id: string;
          progress_percent: number;
          started_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          current_section_id?: string | null;
          last_accessed_at?: string;
          lesson_id: string;
          lesson_version_id: string;
          progress_percent?: number;
          started_at?: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          current_section_id?: string | null;
          last_accessed_at?: string;
          lesson_id?: string;
          lesson_version_id?: string;
          progress_percent?: number;
          started_at?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_lesson_progress_current_section_fkey";
            columns: ["lesson_version_id", "current_section_id"];
            isOneToOne: false;
            referencedRelation: "lesson_sections";
            referencedColumns: ["lesson_version_id", "id"];
          },
          {
            foreignKeyName: "learner_lesson_progress_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learner_lesson_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "learner_lesson_progress_version_fkey";
            columns: ["lesson_id", "lesson_version_id"];
            isOneToOne: false;
            referencedRelation: "lesson_versions";
            referencedColumns: ["lesson_id", "id"];
          },
        ];
      };
      placement_attempts: {
        Row: {
          answers: Json;
          created_at: string;
          current_position: number;
          id: string;
          max_score: number | null;
          placement_test_id: string;
          recommended_level: string | null;
          revision: number;
          score: number | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answers?: Json;
          created_at?: string;
          current_position?: number;
          id?: string;
          max_score?: number | null;
          placement_test_id: string;
          recommended_level?: string | null;
          revision?: number;
          score?: number | null;
          start_idempotency_key: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answers?: Json;
          created_at?: string;
          current_position?: number;
          id?: string;
          max_score?: number | null;
          placement_test_id?: string;
          recommended_level?: string | null;
          revision?: number;
          score?: number | null;
          start_idempotency_key?: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "placement_attempts_placement_test_id_fkey";
            columns: ["placement_test_id"];
            isOneToOne: false;
            referencedRelation: "placement_tests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "placement_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      placement_questions: {
        Row: {
          correct_option_id: string;
          created_at: string;
          id: string;
          options: Json;
          placement_test_id: string;
          position: number;
          prompt: string;
          skill: string;
        };
        Insert: {
          correct_option_id: string;
          created_at?: string;
          id?: string;
          options: Json;
          placement_test_id: string;
          position: number;
          prompt: string;
          skill: string;
        };
        Update: {
          correct_option_id?: string;
          created_at?: string;
          id?: string;
          options?: Json;
          placement_test_id?: string;
          position?: number;
          prompt?: string;
          skill?: string;
        };
        Relationships: [
          {
            foreignKeyName: "placement_questions_placement_test_id_fkey";
            columns: ["placement_test_id"];
            isOneToOne: false;
            referencedRelation: "placement_tests";
            referencedColumns: ["id"];
          },
        ];
      };
      placement_tests: {
        Row: {
          created_at: string;
          id: string;
          published_at: string | null;
          slug: string;
          status: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          published_at?: string | null;
          slug: string;
          status?: string;
          title: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          published_at?: string | null;
          slug?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      learner_profiles: {
        Row: {
          created_at: string;
          current_band: number | null;
          daily_study_minutes: number | null;
          onboarding_completed_at: string | null;
          onboarding_step: number;
          primary_goal: string | null;
          priority_skills: string[];
          study_days_per_week: number | null;
          target_band: number | null;
          target_exam_date: string | null;
          test_type: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_band?: number | null;
          daily_study_minutes?: number | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          primary_goal?: string | null;
          priority_skills?: string[];
          study_days_per_week?: number | null;
          target_band?: number | null;
          target_exam_date?: string | null;
          test_type?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_band?: number | null;
          daily_study_minutes?: number | null;
          onboarding_completed_at?: string | null;
          onboarding_step?: number;
          primary_goal?: string | null;
          priority_skills?: string[];
          study_days_per_week?: number | null;
          target_band?: number | null;
          target_exam_date?: string | null;
          test_type?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      learner_section_progress: {
        Row: {
          completed_at: string | null;
          created_at: string;
          last_viewed_at: string;
          lesson_id: string;
          lesson_version_id: string;
          section_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          last_viewed_at?: string;
          lesson_id: string;
          lesson_version_id: string;
          section_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          last_viewed_at?: string;
          lesson_id?: string;
          lesson_version_id?: string;
          section_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "learner_section_progress_lesson_fkey";
            columns: ["user_id", "lesson_id"];
            isOneToOne: false;
            referencedRelation: "learner_lesson_progress";
            referencedColumns: ["user_id", "lesson_id"];
          },
          {
            foreignKeyName: "learner_section_progress_section_fkey";
            columns: ["lesson_version_id", "section_id"];
            isOneToOne: false;
            referencedRelation: "lesson_sections";
            referencedColumns: ["lesson_version_id", "id"];
          },
          {
            foreignKeyName: "learner_section_progress_version_fkey";
            columns: ["lesson_id", "lesson_version_id"];
            isOneToOne: false;
            referencedRelation: "lesson_versions";
            referencedColumns: ["lesson_id", "id"];
          },
        ];
      };
      learning_modules: {
        Row: {
          created_at: string;
          description: string;
          difficulty: string;
          display_order: number;
          estimated_minutes: number;
          id: string;
          published_at: string | null;
          skill: string;
          slug: string;
          status: string;
          test_type: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          difficulty: string;
          display_order: number;
          estimated_minutes: number;
          id?: string;
          published_at?: string | null;
          skill: string;
          slug: string;
          status?: string;
          test_type: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          difficulty?: string;
          display_order?: number;
          estimated_minutes?: number;
          id?: string;
          published_at?: string | null;
          skill?: string;
          slug?: string;
          status?: string;
          test_type?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_sections: {
        Row: {
          body_markdown: string;
          created_at: string;
          display_order: number;
          id: string;
          is_required: boolean;
          lesson_version_id: string;
          section_type: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          body_markdown: string;
          created_at?: string;
          display_order: number;
          id?: string;
          is_required?: boolean;
          lesson_version_id: string;
          section_type: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          body_markdown?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_required?: boolean;
          lesson_version_id?: string;
          section_type?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_sections_lesson_version_id_fkey";
            columns: ["lesson_version_id"];
            isOneToOne: false;
            referencedRelation: "lesson_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      lesson_versions: {
        Row: {
          archived_at: string | null;
          created_at: string;
          difficulty: string;
          estimated_minutes: number;
          id: string;
          lesson_id: string;
          published_at: string | null;
          status: string;
          summary: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          difficulty: string;
          estimated_minutes: number;
          id?: string;
          lesson_id: string;
          published_at?: string | null;
          status?: string;
          summary: string;
          title: string;
          updated_at?: string;
          version: number;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          difficulty?: string;
          estimated_minutes?: number;
          id?: string;
          lesson_id?: string;
          published_at?: string | null;
          status?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_versions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          module_id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order: number;
          id?: string;
          module_id: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          module_id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "learning_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      listening_audio_assets: {
        Row: {
          asset_path: string;
          created_at: string;
          duration_seconds: number;
          id: string;
          licence: string;
          mime_type: string;
          sha256: string;
          slug: string;
          source_name: string;
          source_url: string | null;
          updated_at: string;
        };
        Insert: {
          asset_path: string;
          created_at?: string;
          duration_seconds: number;
          id?: string;
          licence: string;
          mime_type: string;
          sha256: string;
          slug: string;
          source_name: string;
          source_url?: string | null;
          updated_at?: string;
        };
        Update: {
          asset_path?: string;
          created_at?: string;
          duration_seconds?: number;
          id?: string;
          licence?: string;
          mime_type?: string;
          sha256?: string;
          slug?: string;
          source_name?: string;
          source_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      listening_parts: {
        Row: {
          audio_end_seconds: number;
          audio_start_seconds: number;
          created_at: string;
          exercise_set_version_id: string;
          id: string;
          instructions_markdown: string;
          position: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          audio_end_seconds: number;
          audio_start_seconds: number;
          created_at?: string;
          exercise_set_version_id: string;
          id?: string;
          instructions_markdown: string;
          position: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          audio_end_seconds?: number;
          audio_start_seconds?: number;
          created_at?: string;
          exercise_set_version_id?: string;
          id?: string;
          instructions_markdown?: string;
          position?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listening_parts_exercise_set_version_id_fkey";
            columns: ["exercise_set_version_id"];
            isOneToOne: false;
            referencedRelation: "listening_practice_versions";
            referencedColumns: ["exercise_set_version_id"];
          },
        ];
      };
      listening_practice_versions: {
        Row: {
          audio_asset_id: string;
          created_at: string;
          exercise_set_version_id: string;
          test_type: string;
          time_limit_seconds: number;
          updated_at: string;
        };
        Insert: {
          audio_asset_id: string;
          created_at?: string;
          exercise_set_version_id: string;
          test_type: string;
          time_limit_seconds: number;
          updated_at?: string;
        };
        Update: {
          audio_asset_id?: string;
          created_at?: string;
          exercise_set_version_id?: string;
          test_type?: string;
          time_limit_seconds?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listening_practice_versions_audio_asset_id_fkey";
            columns: ["audio_asset_id"];
            isOneToOne: false;
            referencedRelation: "listening_audio_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listening_practice_versions_exercise_set_version_id_fkey";
            columns: ["exercise_set_version_id"];
            isOneToOne: true;
            referencedRelation: "exercise_set_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_test_results: {
        Row: {
          created_at: string;
          generated_at: string;
          id: string;
          listening_max_score: number | null;
          listening_score: number | null;
          mock_test_version_id: string;
          reading_max_score: number | null;
          reading_score: number | null;
          session_id: string;
          speaking_attempt_id: string | null;
          user_id: string;
          writing_submission_id: string | null;
        };
        Insert: {
          created_at?: string;
          generated_at?: string;
          id?: string;
          listening_max_score?: number | null;
          listening_score?: number | null;
          mock_test_version_id: string;
          reading_max_score?: number | null;
          reading_score?: number | null;
          session_id: string;
          speaking_attempt_id?: string | null;
          user_id: string;
          writing_submission_id?: string | null;
        };
        Update: {
          created_at?: string;
          generated_at?: string;
          id?: string;
          listening_max_score?: number | null;
          listening_score?: number | null;
          mock_test_version_id?: string;
          reading_max_score?: number | null;
          reading_score?: number | null;
          session_id?: string;
          speaking_attempt_id?: string | null;
          user_id?: string;
          writing_submission_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mock_test_results_session_owner_fkey";
            columns: ["session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "mock_test_sessions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "mock_test_results_session_version_fkey";
            columns: ["session_id", "mock_test_version_id"];
            isOneToOne: false;
            referencedRelation: "mock_test_sessions";
            referencedColumns: ["id", "mock_test_version_id"];
          },
          {
            foreignKeyName: "mock_test_results_speaking_attempt_id_fkey";
            columns: ["speaking_attempt_id"];
            isOneToOne: false;
            referencedRelation: "speaking_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_test_results_writing_submission_id_fkey";
            columns: ["writing_submission_id"];
            isOneToOne: false;
            referencedRelation: "writing_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_test_section_attempts: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          learner_attempt_id: string | null;
          mock_test_section_id: string;
          mock_test_version_id: string;
          section_type: string;
          session_id: string;
          speaking_attempt_id: string | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
          writing_submission_id: string | null;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          learner_attempt_id?: string | null;
          mock_test_section_id: string;
          mock_test_version_id: string;
          section_type: string;
          session_id: string;
          speaking_attempt_id?: string | null;
          start_idempotency_key: string;
          started_at: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_after_time_limit?: boolean | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id: string;
          writing_submission_id?: string | null;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          learner_attempt_id?: string | null;
          mock_test_section_id?: string;
          mock_test_version_id?: string;
          section_type?: string;
          session_id?: string;
          speaking_attempt_id?: string | null;
          start_idempotency_key?: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_after_time_limit?: boolean | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id?: string;
          writing_submission_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mock_test_section_attempts_learner_attempt_id_fkey";
            columns: ["learner_attempt_id"];
            isOneToOne: true;
            referencedRelation: "learner_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_test_section_attempts_section_version_fkey";
            columns: ["mock_test_version_id", "mock_test_section_id"];
            isOneToOne: false;
            referencedRelation: "mock_test_sections";
            referencedColumns: ["mock_test_version_id", "id"];
          },
          {
            foreignKeyName: "mock_test_section_attempts_session_owner_fkey";
            columns: ["session_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "mock_test_sessions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "mock_test_section_attempts_session_version_fkey";
            columns: ["session_id", "mock_test_version_id"];
            isOneToOne: false;
            referencedRelation: "mock_test_sessions";
            referencedColumns: ["id", "mock_test_version_id"];
          },
          {
            foreignKeyName: "mock_test_section_attempts_speaking_attempt_id_fkey";
            columns: ["speaking_attempt_id"];
            isOneToOne: true;
            referencedRelation: "speaking_attempts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_test_section_attempts_writing_submission_id_fkey";
            columns: ["writing_submission_id"];
            isOneToOne: true;
            referencedRelation: "writing_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_test_sections: {
        Row: {
          created_at: string;
          exercise_set_version_id: string | null;
          id: string;
          mock_test_version_id: string;
          required: boolean;
          section_order: number;
          section_type: string;
          speaking_set_version_id: string | null;
          time_limit_seconds: number;
          updated_at: string;
          writing_task_version_id: string | null;
        };
        Insert: {
          created_at?: string;
          exercise_set_version_id?: string | null;
          id?: string;
          mock_test_version_id: string;
          required?: boolean;
          section_order: number;
          section_type: string;
          speaking_set_version_id?: string | null;
          time_limit_seconds: number;
          updated_at?: string;
          writing_task_version_id?: string | null;
        };
        Update: {
          created_at?: string;
          exercise_set_version_id?: string | null;
          id?: string;
          mock_test_version_id?: string;
          required?: boolean;
          section_order?: number;
          section_type?: string;
          speaking_set_version_id?: string | null;
          time_limit_seconds?: number;
          updated_at?: string;
          writing_task_version_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "mock_test_sections_exercise_set_version_id_fkey";
            columns: ["exercise_set_version_id"];
            isOneToOne: false;
            referencedRelation: "exercise_set_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_test_sections_mock_test_version_id_fkey";
            columns: ["mock_test_version_id"];
            isOneToOne: false;
            referencedRelation: "mock_test_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_test_sections_speaking_set_version_id_fkey";
            columns: ["speaking_set_version_id"];
            isOneToOne: false;
            referencedRelation: "speaking_set_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_test_sections_writing_task_version_id_fkey";
            columns: ["writing_task_version_id"];
            isOneToOne: false;
            referencedRelation: "writing_task_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_test_sessions: {
        Row: {
          completed_at: string | null;
          created_at: string;
          current_section_order: number | null;
          id: string;
          mock_test_id: string;
          mock_test_version_id: string;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          current_section_order?: number | null;
          id?: string;
          mock_test_id: string;
          mock_test_version_id: string;
          start_idempotency_key: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          current_section_order?: number | null;
          id?: string;
          mock_test_id?: string;
          mock_test_version_id?: string;
          start_idempotency_key?: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mock_test_sessions_mock_test_id_fkey";
            columns: ["mock_test_id"];
            isOneToOne: false;
            referencedRelation: "mock_tests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mock_test_sessions_test_version_fkey";
            columns: ["mock_test_id", "mock_test_version_id"];
            isOneToOne: false;
            referencedRelation: "mock_test_versions";
            referencedColumns: ["mock_test_id", "id"];
          },
          {
            foreignKeyName: "mock_test_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_test_versions: {
        Row: {
          created_at: string;
          description: string;
          difficulty: string;
          estimated_minutes: number;
          id: string;
          mock_test_id: string;
          published_at: string | null;
          status: string;
          test_type: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          description: string;
          difficulty: string;
          estimated_minutes: number;
          id?: string;
          mock_test_id: string;
          published_at?: string | null;
          status?: string;
          test_type: string;
          title: string;
          updated_at?: string;
          version: number;
        };
        Update: {
          created_at?: string;
          description?: string;
          difficulty?: string;
          estimated_minutes?: number;
          id?: string;
          mock_test_id?: string;
          published_at?: string | null;
          status?: string;
          test_type?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "mock_test_versions_mock_test_id_fkey";
            columns: ["mock_test_id"];
            isOneToOne: false;
            referencedRelation: "mock_tests";
            referencedColumns: ["id"];
          },
        ];
      };
      mock_tests: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          locale: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          locale?: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          locale?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reading_passage_sections: {
        Row: {
          body_markdown: string;
          created_at: string;
          heading: string | null;
          id: string;
          position: number;
          reading_passage_version_id: string;
          updated_at: string;
        };
        Insert: {
          body_markdown: string;
          created_at?: string;
          heading?: string | null;
          id?: string;
          position: number;
          reading_passage_version_id: string;
          updated_at?: string;
        };
        Update: {
          body_markdown?: string;
          created_at?: string;
          heading?: string | null;
          id?: string;
          position?: number;
          reading_passage_version_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_passage_sections_reading_passage_version_id_fkey";
            columns: ["reading_passage_version_id"];
            isOneToOne: false;
            referencedRelation: "reading_passage_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      reading_passage_versions: {
        Row: {
          archived_at: string | null;
          created_at: string;
          difficulty: string;
          id: string;
          licence: string;
          published_at: string | null;
          reading_passage_id: string;
          source_name: string;
          source_url: string | null;
          status: string;
          summary: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          difficulty: string;
          id?: string;
          licence: string;
          published_at?: string | null;
          reading_passage_id: string;
          source_name: string;
          source_url?: string | null;
          status?: string;
          summary: string;
          title: string;
          updated_at?: string;
          version: number;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          difficulty?: string;
          id?: string;
          licence?: string;
          published_at?: string | null;
          reading_passage_id?: string;
          source_name?: string;
          source_url?: string | null;
          status?: string;
          summary?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "reading_passage_versions_reading_passage_id_fkey";
            columns: ["reading_passage_id"];
            isOneToOne: false;
            referencedRelation: "reading_passages";
            referencedColumns: ["id"];
          },
        ];
      };
      reading_passages: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          slug: string;
          test_type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order: number;
          id?: string;
          slug: string;
          test_type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug?: string;
          test_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reading_practice_versions: {
        Row: {
          created_at: string;
          exercise_set_version_id: string;
          reading_passage_version_id: string;
          time_limit_seconds: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          exercise_set_version_id: string;
          reading_passage_version_id: string;
          time_limit_seconds: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          exercise_set_version_id?: string;
          reading_passage_version_id?: string;
          time_limit_seconds?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_practice_versions_exercise_set_version_id_fkey";
            columns: ["exercise_set_version_id"];
            isOneToOne: true;
            referencedRelation: "exercise_set_versions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reading_practice_versions_reading_passage_version_id_fkey";
            columns: ["reading_passage_version_id"];
            isOneToOne: true;
            referencedRelation: "reading_passage_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      reading_question_groups: {
        Row: {
          created_at: string;
          exercise_set_version_id: string;
          group_type: string;
          id: string;
          instructions_markdown: string;
          max_answer_words: number | null;
          passage_section_id: string | null;
          position: number;
          reading_passage_version_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          exercise_set_version_id: string;
          group_type: string;
          id?: string;
          instructions_markdown: string;
          max_answer_words?: number | null;
          passage_section_id?: string | null;
          position: number;
          reading_passage_version_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          exercise_set_version_id?: string;
          group_type?: string;
          id?: string;
          instructions_markdown?: string;
          max_answer_words?: number | null;
          passage_section_id?: string | null;
          position?: number;
          reading_passage_version_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reading_question_groups_practice_fkey";
            columns: ["exercise_set_version_id", "reading_passage_version_id"];
            isOneToOne: false;
            referencedRelation: "reading_practice_versions";
            referencedColumns: [
              "exercise_set_version_id",
              "reading_passage_version_id",
            ];
          },
          {
            foreignKeyName: "reading_question_groups_section_fkey";
            columns: ["reading_passage_version_id", "passage_section_id"];
            isOneToOne: false;
            referencedRelation: "reading_passage_sections";
            referencedColumns: ["reading_passage_version_id", "id"];
          },
        ];
      };
      speaking_attempts: {
        Row: {
          created_at: string;
          id: string;
          is_mock: boolean;
          speaking_set_id: string;
          speaking_set_version_id: string;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_mock?: boolean;
          speaking_set_id: string;
          speaking_set_version_id: string;
          start_idempotency_key: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_mock?: boolean;
          speaking_set_id?: string;
          speaking_set_version_id?: string;
          start_idempotency_key?: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_attempts_set_version_fkey";
            columns: ["speaking_set_id", "speaking_set_version_id"];
            isOneToOne: false;
            referencedRelation: "speaking_set_versions";
            referencedColumns: ["speaking_set_id", "id"];
          },
          {
            foreignKeyName: "speaking_attempts_speaking_set_id_fkey";
            columns: ["speaking_set_id"];
            isOneToOne: false;
            referencedRelation: "speaking_sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "speaking_attempts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      speaking_audio_assets: {
        Row: {
          attempt_id: string;
          bucket_id: string;
          cleanup_started_at: string | null;
          created_at: string;
          deleted_at: string | null;
          duration_seconds: number;
          id: string;
          mime_type: string;
          response_id: string;
          retention_until: string;
          sha256_checksum: string;
          size_bytes: number;
          status: string;
          storage_path: string;
          updated_at: string;
          upload_intent_id: string | null;
          user_id: string;
        };
        Insert: {
          attempt_id: string;
          bucket_id?: string;
          cleanup_started_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          duration_seconds: number;
          id?: string;
          mime_type: string;
          response_id: string;
          retention_until?: string | null;
          sha256_checksum: string;
          size_bytes: number;
          status?: string;
          storage_path: string;
          updated_at?: string;
          upload_intent_id?: string | null;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          bucket_id?: string;
          cleanup_started_at?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          duration_seconds?: number;
          id?: string;
          mime_type?: string;
          response_id?: string;
          retention_until?: string;
          sha256_checksum?: string;
          size_bytes?: number;
          status?: string;
          storage_path?: string;
          updated_at?: string;
          upload_intent_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_audio_assets_response_scope_fkey";
            columns: ["response_id", "attempt_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "speaking_responses";
            referencedColumns: ["id", "attempt_id", "user_id"];
          },
          {
            foreignKeyName: "speaking_audio_assets_upload_intent_id_fkey";
            columns: ["upload_intent_id"];
            isOneToOne: true;
            referencedRelation: "speaking_upload_intents";
            referencedColumns: ["id"];
          },
        ];
      };
      speaking_feedback: {
        Row: {
          attempt_id: string;
          confidence: string;
          created_at: string;
          criteria: Json;
          disclaimer: string;
          estimated_fluency_band: number | null;
          estimated_grammar_band: number | null;
          estimated_lexical_band: number | null;
          estimated_overall_band: number | null;
          estimated_pronunciation_band: number | null;
          id: string;
          pronunciation_scope: string;
          run_id: string;
          strengths: Json;
          suggestions: Json;
          summary: string;
          user_id: string;
        };
        Insert: {
          attempt_id: string;
          confidence: string;
          created_at?: string;
          criteria: Json;
          disclaimer: string;
          estimated_fluency_band?: number | null;
          estimated_grammar_band?: number | null;
          estimated_lexical_band?: number | null;
          estimated_overall_band?: number | null;
          estimated_pronunciation_band?: number | null;
          id?: string;
          pronunciation_scope: string;
          run_id: string;
          strengths: Json;
          suggestions: Json;
          summary: string;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          confidence?: string;
          created_at?: string;
          criteria?: Json;
          disclaimer?: string;
          estimated_fluency_band?: number | null;
          estimated_grammar_band?: number | null;
          estimated_lexical_band?: number | null;
          estimated_overall_band?: number | null;
          estimated_pronunciation_band?: number | null;
          id?: string;
          pronunciation_scope?: string;
          run_id?: string;
          strengths?: Json;
          suggestions?: Json;
          summary?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_feedback_run_scope_fkey";
            columns: ["run_id", "attempt_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "speaking_feedback_runs";
            referencedColumns: ["id", "attempt_id", "user_id"];
          },
        ];
      };
      speaking_feedback_runs: {
        Row: {
          attempt_id: string;
          attempt_number: number;
          completed_at: string | null;
          consent_version: string;
          created_at: string;
          error_code: string | null;
          id: string;
          lease_expires_at: string;
          model: string;
          prompt_version: string;
          provider: string;
          request_idempotency_key: string;
          requested_at: string;
          rubric_version: string;
          status: string;
          transcript_bundle_checksum: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempt_id: string;
          attempt_number?: number;
          completed_at?: string | null;
          consent_version: string;
          created_at?: string;
          error_code?: string | null;
          id?: string;
          lease_expires_at: string;
          model: string;
          prompt_version: string;
          provider: string;
          request_idempotency_key: string;
          requested_at?: string;
          rubric_version: string;
          status?: string;
          transcript_bundle_checksum: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          attempt_number?: number;
          completed_at?: string | null;
          consent_version?: string;
          created_at?: string;
          error_code?: string | null;
          id?: string;
          lease_expires_at?: string;
          model?: string;
          prompt_version?: string;
          provider?: string;
          request_idempotency_key?: string;
          requested_at?: string;
          rubric_version?: string;
          status?: string;
          transcript_bundle_checksum?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_feedback_runs_attempt_owner_fkey";
            columns: ["attempt_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "speaking_attempts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      speaking_prompts: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          instructions: string;
          is_required: boolean;
          maximum_answer_seconds: number;
          minimum_answer_seconds: number;
          part: string;
          preparation_seconds: number;
          prompt_text: string;
          speaking_set_version_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order: number;
          id?: string;
          instructions: string;
          is_required?: boolean;
          maximum_answer_seconds: number;
          minimum_answer_seconds: number;
          part: string;
          preparation_seconds?: number;
          prompt_text: string;
          speaking_set_version_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          instructions?: string;
          is_required?: boolean;
          maximum_answer_seconds?: number;
          minimum_answer_seconds?: number;
          part?: string;
          preparation_seconds?: number;
          prompt_text?: string;
          speaking_set_version_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_prompts_speaking_set_version_id_fkey";
            columns: ["speaking_set_version_id"];
            isOneToOne: false;
            referencedRelation: "speaking_set_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      speaking_responses: {
        Row: {
          attempt_id: string;
          audio_asset_id: string | null;
          created_at: string;
          id: string;
          prompt_id: string;
          speaking_set_version_id: string;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempt_id: string;
          audio_asset_id?: string | null;
          created_at?: string;
          id?: string;
          prompt_id: string;
          speaking_set_version_id: string;
          submitted_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          audio_asset_id?: string | null;
          created_at?: string;
          id?: string;
          prompt_id?: string;
          speaking_set_version_id?: string;
          submitted_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_responses_attempt_owner_fkey";
            columns: ["attempt_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "speaking_attempts";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "speaking_responses_attempt_version_fkey";
            columns: ["attempt_id", "speaking_set_version_id"];
            isOneToOne: false;
            referencedRelation: "speaking_attempts";
            referencedColumns: ["id", "speaking_set_version_id"];
          },
          {
            foreignKeyName: "speaking_responses_audio_asset_fkey";
            columns: ["audio_asset_id"];
            isOneToOne: false;
            referencedRelation: "speaking_audio_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "speaking_responses_prompt_version_fkey";
            columns: ["speaking_set_version_id", "prompt_id"];
            isOneToOne: false;
            referencedRelation: "speaking_prompts";
            referencedColumns: ["speaking_set_version_id", "id"];
          },
        ];
      };
      speaking_set_versions: {
        Row: {
          content_checksum: string;
          created_at: string;
          description: string;
          difficulty: string;
          estimated_minutes: number;
          id: string;
          instructions: string;
          licence: string;
          published_at: string | null;
          source_name: string;
          speaking_set_id: string;
          status: string;
          test_type: string;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          content_checksum: string;
          created_at?: string;
          description: string;
          difficulty: string;
          estimated_minutes: number;
          id?: string;
          instructions: string;
          licence: string;
          published_at?: string | null;
          source_name: string;
          speaking_set_id: string;
          status?: string;
          test_type: string;
          title: string;
          updated_at?: string;
          version: number;
        };
        Update: {
          content_checksum?: string;
          created_at?: string;
          description?: string;
          difficulty?: string;
          estimated_minutes?: number;
          id?: string;
          instructions?: string;
          licence?: string;
          published_at?: string | null;
          source_name?: string;
          speaking_set_id?: string;
          status?: string;
          test_type?: string;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_set_versions_speaking_set_id_fkey";
            columns: ["speaking_set_id"];
            isOneToOne: false;
            referencedRelation: "speaking_sets";
            referencedColumns: ["id"];
          },
        ];
      };
      speaking_sets: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      speaking_transcript_runs: {
        Row: {
          attempt_number: number;
          audio_checksum: string;
          completed_at: string | null;
          consent_version: string;
          created_at: string;
          error_code: string | null;
          id: string;
          lease_expires_at: string;
          model: string;
          provider: string;
          request_idempotency_key: string;
          requested_at: string;
          response_id: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempt_number?: number;
          audio_checksum: string;
          completed_at?: string | null;
          consent_version: string;
          created_at?: string;
          error_code?: string | null;
          id?: string;
          lease_expires_at: string;
          model: string;
          provider: string;
          request_idempotency_key: string;
          requested_at?: string;
          response_id: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempt_number?: number;
          audio_checksum?: string;
          completed_at?: string | null;
          consent_version?: string;
          created_at?: string;
          error_code?: string | null;
          id?: string;
          lease_expires_at?: string;
          model?: string;
          provider?: string;
          request_idempotency_key?: string;
          requested_at?: string;
          response_id?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_transcript_runs_response_owner_fkey";
            columns: ["response_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "speaking_responses";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      speaking_transcripts: {
        Row: {
          created_at: string;
          id: string;
          language_code: string | null;
          response_id: string;
          run_id: string;
          transcript_text: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          language_code?: string | null;
          response_id: string;
          run_id: string;
          transcript_text: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language_code?: string | null;
          response_id?: string;
          run_id?: string;
          transcript_text?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_transcripts_run_scope_fkey";
            columns: ["run_id", "response_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "speaking_transcript_runs";
            referencedColumns: ["id", "response_id", "user_id"];
          },
        ];
      };
      speaking_upload_intents: {
        Row: {
          attempt_id: string;
          created_at: string;
          expected_duration_seconds: number;
          expected_mime_type: string;
          expected_size_bytes: number;
          expires_at: string;
          finalized_at: string | null;
          id: string;
          idempotency_key: string;
          response_id: string;
          status: string;
          storage_deleted_at: string | null;
          storage_path: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempt_id: string;
          created_at?: string;
          expected_duration_seconds: number;
          expected_mime_type: string;
          expected_size_bytes: number;
          expires_at: string;
          finalized_at?: string | null;
          id?: string;
          idempotency_key: string;
          response_id: string;
          status?: string;
          storage_deleted_at?: string | null;
          storage_path: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempt_id?: string;
          created_at?: string;
          expected_duration_seconds?: number;
          expected_mime_type?: string;
          expected_size_bytes?: number;
          expires_at?: string;
          finalized_at?: string | null;
          id?: string;
          idempotency_key?: string;
          response_id?: string;
          status?: string;
          storage_deleted_at?: string | null;
          storage_path?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speaking_upload_intents_response_scope_fkey";
            columns: ["response_id", "attempt_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "speaking_responses";
            referencedColumns: ["id", "attempt_id", "user_id"];
          },
        ];
      };
      vocabulary_entries: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          normalized_term: string;
          part_of_speech: string;
          sense_key: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order: number;
          id?: string;
          normalized_term: string;
          part_of_speech: string;
          sense_key?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          normalized_term?: string;
          part_of_speech?: string;
          sense_key?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vocabulary_entry_versions: {
        Row: {
          archived_at: string | null;
          created_at: string;
          definition_vi: string;
          difficulty: string;
          example_sentence: string;
          id: string;
          licence: string;
          published_at: string | null;
          related_exercise_set_id: string | null;
          source_name: string;
          status: string;
          tags: string[];
          term: string;
          topic: string;
          updated_at: string;
          version: number;
          vocabulary_entry_id: string;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          definition_vi: string;
          difficulty: string;
          example_sentence: string;
          id?: string;
          licence?: string;
          published_at?: string | null;
          related_exercise_set_id?: string | null;
          source_name?: string;
          status?: string;
          tags?: string[];
          term: string;
          topic: string;
          updated_at?: string;
          version: number;
          vocabulary_entry_id: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          definition_vi?: string;
          difficulty?: string;
          example_sentence?: string;
          id?: string;
          licence?: string;
          published_at?: string | null;
          related_exercise_set_id?: string | null;
          source_name?: string;
          status?: string;
          tags?: string[];
          term?: string;
          topic?: string;
          updated_at?: string;
          version?: number;
          vocabulary_entry_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vocabulary_entry_versions_related_exercise_set_id_fkey";
            columns: ["related_exercise_set_id"];
            isOneToOne: false;
            referencedRelation: "exercise_sets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vocabulary_entry_versions_vocabulary_entry_id_fkey";
            columns: ["vocabulary_entry_id"];
            isOneToOne: false;
            referencedRelation: "vocabulary_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      writing_feedback: {
        Row: {
          coherence_cohesion_band: number;
          confidence: string;
          corrected_examples: Json;
          created_at: string;
          criteria: Json;
          grammatical_range_accuracy_band: number;
          id: string;
          lexical_resource_band: number;
          overall_band_estimate: number;
          priority_issues: Json;
          revision_plan: Json;
          run_id: string;
          strengths: Json;
          submission_id: string;
          summary: string;
          task_response_band: number;
          user_id: string;
        };
        Insert: {
          coherence_cohesion_band: number;
          confidence: string;
          corrected_examples: Json;
          created_at?: string;
          criteria: Json;
          grammatical_range_accuracy_band: number;
          id?: string;
          lexical_resource_band: number;
          overall_band_estimate: number;
          priority_issues: Json;
          revision_plan: Json;
          run_id: string;
          strengths: Json;
          submission_id: string;
          summary: string;
          task_response_band: number;
          user_id: string;
        };
        Update: {
          coherence_cohesion_band?: number;
          confidence?: string;
          corrected_examples?: Json;
          created_at?: string;
          criteria?: Json;
          grammatical_range_accuracy_band?: number;
          id?: string;
          lexical_resource_band?: number;
          overall_band_estimate?: number;
          priority_issues?: Json;
          revision_plan?: Json;
          run_id?: string;
          strengths?: Json;
          submission_id?: string;
          summary?: string;
          task_response_band?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "writing_feedback_run_scope_fkey";
            columns: ["run_id", "submission_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "writing_feedback_runs";
            referencedColumns: ["id", "submission_id", "user_id"];
          },
        ];
      };
      writing_feedback_runs: {
        Row: {
          attempt_number: number;
          completed_at: string | null;
          consent_version: string;
          created_at: string;
          error_code: string | null;
          finalize_nonce: string;
          id: string;
          input_checksum: string;
          input_tokens: number | null;
          latency_ms: number | null;
          lease_expires_at: string;
          model_label: string | null;
          output_schema_version: string;
          output_tokens: number | null;
          prompt_version: string;
          provider: string | null;
          provider_started_at: string | null;
          request_hash: string;
          request_idempotency_key: string;
          requested_at: string;
          rubric_version: string;
          status: string;
          submission_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempt_number: number;
          completed_at?: string | null;
          consent_version: string;
          created_at?: string;
          error_code?: string | null;
          finalize_nonce?: string;
          id?: string;
          input_checksum: string;
          input_tokens?: number | null;
          latency_ms?: number | null;
          lease_expires_at: string;
          model_label?: string | null;
          output_schema_version?: string;
          output_tokens?: number | null;
          prompt_version?: string;
          provider?: string | null;
          provider_started_at?: string | null;
          request_hash: string;
          request_idempotency_key: string;
          requested_at?: string;
          rubric_version?: string;
          status?: string;
          submission_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempt_number?: number;
          completed_at?: string | null;
          consent_version?: string;
          created_at?: string;
          error_code?: string | null;
          finalize_nonce?: string;
          id?: string;
          input_checksum?: string;
          input_tokens?: number | null;
          latency_ms?: number | null;
          lease_expires_at?: string;
          model_label?: string | null;
          output_schema_version?: string;
          output_tokens?: number | null;
          prompt_version?: string;
          provider?: string | null;
          provider_started_at?: string | null;
          request_hash?: string;
          request_idempotency_key?: string;
          requested_at?: string;
          rubric_version?: string;
          status?: string;
          submission_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "writing_feedback_runs_submission_owner_fkey";
            columns: ["submission_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "writing_submissions";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "writing_feedback_runs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      writing_submissions: {
        Row: {
          content_checksum: string | null;
          created_at: string;
          draft_text: string;
          expires_at: string;
          id: string;
          is_mock: boolean;
          last_saved_at: string;
          minimum_words_met: boolean;
          server_revision: number;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          submitted_text: string | null;
          updated_at: string;
          user_id: string;
          word_count: number;
          writing_task_id: string;
          writing_task_version_id: string;
        };
        Insert: {
          content_checksum?: string | null;
          created_at?: string;
          draft_text?: string;
          expires_at: string;
          id?: string;
          is_mock?: boolean;
          last_saved_at?: string;
          minimum_words_met?: boolean;
          server_revision?: number;
          start_idempotency_key: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_after_time_limit?: boolean | null;
          submitted_at?: string | null;
          submitted_text?: string | null;
          updated_at?: string;
          user_id: string;
          word_count?: number;
          writing_task_id: string;
          writing_task_version_id: string;
        };
        Update: {
          content_checksum?: string | null;
          created_at?: string;
          draft_text?: string;
          expires_at?: string;
          id?: string;
          is_mock?: boolean;
          last_saved_at?: string;
          minimum_words_met?: boolean;
          server_revision?: number;
          start_idempotency_key?: string;
          started_at?: string;
          status?: string;
          submit_idempotency_key?: string | null;
          submitted_after_time_limit?: boolean | null;
          submitted_at?: string | null;
          submitted_text?: string | null;
          updated_at?: string;
          user_id?: string;
          word_count?: number;
          writing_task_id?: string;
          writing_task_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "writing_submissions_task_version_fkey";
            columns: ["writing_task_id", "writing_task_version_id"];
            isOneToOne: false;
            referencedRelation: "writing_task_versions";
            referencedColumns: ["writing_task_id", "id"];
          },
          {
            foreignKeyName: "writing_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "writing_submissions_writing_task_id_fkey";
            columns: ["writing_task_id"];
            isOneToOne: false;
            referencedRelation: "writing_tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      writing_task_versions: {
        Row: {
          content_checksum: string;
          created_at: string;
          description: string;
          difficulty: string;
          id: string;
          instructions: string;
          licence: string;
          maximum_words: number;
          minimum_words: number;
          prompt_text: string;
          published_at: string | null;
          source_name: string;
          status: string;
          task_type: string;
          test_type: string;
          time_limit_seconds: number;
          title: string;
          updated_at: string;
          version: number;
          word_target: number;
          writing_task_id: string;
        };
        Insert: {
          content_checksum: string;
          created_at?: string;
          description: string;
          difficulty: string;
          id?: string;
          instructions: string;
          licence: string;
          maximum_words: number;
          minimum_words: number;
          prompt_text: string;
          published_at?: string | null;
          source_name: string;
          status?: string;
          task_type: string;
          test_type: string;
          time_limit_seconds: number;
          title: string;
          updated_at?: string;
          version: number;
          word_target: number;
          writing_task_id: string;
        };
        Update: {
          content_checksum?: string;
          created_at?: string;
          description?: string;
          difficulty?: string;
          id?: string;
          instructions?: string;
          licence?: string;
          maximum_words?: number;
          minimum_words?: number;
          prompt_text?: string;
          published_at?: string | null;
          source_name?: string;
          status?: string;
          task_type?: string;
          test_type?: string;
          time_limit_seconds?: number;
          title?: string;
          updated_at?: string;
          version?: number;
          word_target?: number;
          writing_task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "writing_task_versions_writing_task_id_fkey";
            columns: ["writing_task_id"];
            isOneToOne: false;
            referencedRelation: "writing_tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      writing_tasks: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_roles: {
        Row: {
          created_at: string;
          id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_policy_acceptances: {
        Row: {
          accepted_at: string;
          channel: string;
          id: string;
          privacy_version: string;
          terms_version: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string;
          channel?: string;
          id?: string;
          privacy_version: string;
          terms_version: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string;
          channel?: string;
          id?: string;
          privacy_version?: string;
          terms_version?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_gamification: {
        Row: {
          created_at: string;
          current_level: number;
          current_streak: number;
          last_activity_date: string | null;
          longest_streak: number;
          streak_freezes_available: number;
          total_xp: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          current_level?: number;
          current_streak?: number;
          last_activity_date?: string | null;
          longest_streak?: number;
          streak_freezes_available?: number;
          total_xp?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          current_level?: number;
          current_streak?: number;
          last_activity_date?: string | null;
          longest_streak?: number;
          streak_freezes_available?: number;
          total_xp?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      xp_events: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          source: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          source: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          source?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      weekly_leaderboards: {
        Row: {
          created_at: string;
          id: string;
          rank: number | null;
          user_id: string;
          week_end: string;
          week_start: string;
          weekly_xp: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          rank?: number | null;
          user_id: string;
          week_end: string;
          week_start: string;
          weekly_xp?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          rank?: number | null;
          user_id?: string;
          week_end?: string;
          week_start?: string;
          weekly_xp?: number;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string;
          gateway_customer_id: string | null;
          gateway_subscription_id: string | null;
          id: string;
          payment_gateway: string | null;
          status: string;
          tier: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string;
          gateway_customer_id?: string | null;
          gateway_subscription_id?: string | null;
          id?: string;
          payment_gateway?: string | null;
          status?: string;
          tier?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string;
          gateway_customer_id?: string | null;
          gateway_subscription_id?: string | null;
          id?: string;
          payment_gateway?: string | null;
          status?: string;
          tier?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      dictation_exercises: {
        Row: {
          audio_url: string;
          audio_url_low: string | null;
          category: string;
          created_at: string;
          description: string | null;
          difficulty: number;
          duration_seconds: number;
          id: string;
          is_published: boolean;
          thumbnail_url: string | null;
          title: string;
          total_sentences: number;
          updated_at: string;
        };
        Insert: {
          audio_url: string;
          audio_url_low?: string | null;
          category?: string;
          created_at?: string;
          description?: string | null;
          difficulty: number;
          duration_seconds?: number;
          id?: string;
          is_published?: boolean;
          thumbnail_url?: string | null;
          title: string;
          total_sentences?: number;
          updated_at?: string;
        };
        Update: {
          audio_url?: string;
          audio_url_low?: string | null;
          category?: string;
          created_at?: string;
          description?: string | null;
          difficulty?: number;
          duration_seconds?: number;
          id?: string;
          is_published?: boolean;
          thumbnail_url?: string | null;
          title?: string;
          total_sentences?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      dictation_sentences: {
        Row: {
          end_time: number;
          exercise_id: string;
          hint: string | null;
          id: string;
          order_index: number;
          start_time: number;
          text: string;
        };
        Insert: {
          end_time: number;
          exercise_id: string;
          hint?: string | null;
          id?: string;
          order_index: number;
          start_time: number;
          text: string;
        };
        Update: {
          end_time?: number;
          exercise_id?: string;
          hint?: string | null;
          id?: string;
          order_index?: number;
          start_time?: number;
          text?: string;
        };
        Relationships: [];
      };
      dictation_attempts: {
        Row: {
          accuracy_score: number;
          correct_words: number;
          created_at: string;
          exercise_id: string;
          id: string;
          replay_count: number | null;
          sentence_id: string;
          time_spent_seconds: number | null;
          total_words: number;
          user_id: string;
          user_input: string;
        };
        Insert: {
          accuracy_score?: number;
          correct_words?: number;
          created_at?: string;
          exercise_id: string;
          id?: string;
          replay_count?: number | null;
          sentence_id: string;
          time_spent_seconds?: number | null;
          total_words?: number;
          user_id: string;
          user_input: string;
        };
        Update: {
          accuracy_score?: number;
          correct_words?: number;
          created_at?: string;
          exercise_id?: string;
          id?: string;
          replay_count?: number | null;
          sentence_id?: string;
          time_spent_seconds?: number | null;
          total_words?: number;
          user_id?: string;
          user_input?: string;
        };
        Relationships: [];
      };
      dictation_progress: {
        Row: {
          attempts_count: number;
          best_score: number;
          completed: boolean;
          completed_sentences: number;
          created_at: string;
          exercise_id: string;
          id: string;
          last_attempted_at: string;
          latest_score: number;
          total_sentences: number;
          user_id: string;
        };
        Insert: {
          attempts_count?: number;
          best_score?: number;
          completed?: boolean;
          completed_sentences?: number;
          created_at?: string;
          exercise_id: string;
          id?: string;
          last_attempted_at?: string;
          latest_score?: number;
          total_sentences?: number;
          user_id: string;
        };
        Update: {
          attempts_count?: number;
          best_score?: number;
          completed?: boolean;
          completed_sentences?: number;
          created_at?: string;
          exercise_id?: string;
          id?: string;
          last_attempted_at?: string;
          latest_score?: number;
          total_sentences?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_generated_contents: {
        Row: {
          content_type: string;
          created_at: string;
          id: string;
          raw_content: string | null;
          source_url: string | null;
          status: string;
          structured_data: Json;
          updated_at: string;
        };
        Insert: {
          content_type: string;
          created_at?: string;
          id?: string;
          raw_content?: string | null;
          source_url?: string | null;
          status?: string;
          structured_data: Json;
          updated_at?: string;
        };
        Update: {
          content_type?: string;
          created_at?: string;
          id?: string;
          raw_content?: string | null;
          source_url?: string | null;
          status?: string;
          structured_data?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_events: {
        Row: {
          created_at: string;
          error_message: string | null;
          event_type: string;
          gateway: string;
          gateway_event_id: string;
          id: string;
          payload: Json;
          processed_at: string | null;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          event_type: string;
          gateway: string;
          gateway_event_id: string;
          id?: string;
          payload: Json;
          processed_at?: string | null;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          event_type?: string;
          gateway?: string;
          gateway_event_id?: string;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      bulk_import_jobs: {
        Row: {
          author_id: string;
          completed_at: string | null;
          created_at: string;
          error_log: Json | null;
          file_url: string;
          id: string;
          job_type: string;
          processed_records: number | null;
          started_at: string | null;
          status: string;
          total_records: number | null;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          completed_at?: string | null;
          created_at?: string;
          error_log?: Json | null;
          file_url: string;
          id?: string;
          job_type: string;
          processed_records?: number | null;
          started_at?: string | null;
          status?: string;
          total_records?: number | null;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          completed_at?: string | null;
          created_at?: string;
          error_log?: Json | null;
          file_url?: string;
          id?: string;
          job_type?: string;
          processed_records?: number | null;
          started_at?: string | null;
          status?: string;
          total_records?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      admin_users: {
        Row: {
          user_id: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      accept_current_policies: {
        Args: {
          p_channel?: string;
          p_privacy_version: string;
          p_terms_version: string;
        };
        Returns: Database["public"]["Tables"]["user_policy_acceptances"]["Row"];
      };
      award_xp: {
        Args: {
          target_user_id: string;
          xp_amount: number;
          xp_source: string;
        };
        Returns: undefined;
      };
      buy_streak_freeze: {
        Args: { p_cost?: number };
        Returns: Database["public"]["Tables"]["user_gamification"]["Row"];
      };
      check_exercise_answer: {
        Args: { p_attempt_id: string; p_question_id: string };
        Returns: Json;
      };
      claim_speaking_audio_cleanup: {
        Args: { p_batch_size?: number };
        Returns: {
          bucket_id: string;
          id: string;
          storage_path: string;
        }[];
      };
      finalize_r2_speaking_upload: {
        Args: {
          p_attempt_id: string;
          p_duration_seconds: number;
          p_mime_type: string;
          p_prompt_id: string;
          p_sha256_checksum: string;
          p_size_bytes: number;
          p_storage_path: string;
        };
        Returns: Database["public"]["Tables"]["speaking_audio_assets"]["Row"];
      };
      fn_get_user_dictation_stats: {
        Args: { p_user_id?: string };
        Returns: Json;
      };
      fn_submit_dictation_answer: {
        Args: {
          p_exercise_id: string;
          p_replay_count?: number;
          p_sentence_id: string;
          p_time_spent?: number;
          p_user_id?: string | null;
          p_user_input: string;
        };
        Returns: Json;
      };
      get_learner_ai_quota_usage: {
        Args: never;
        Returns: Json;
      };
      save_exercise_draft_json: {
        Args: { p_answers: Json; p_attempt_id: string };
        Returns: Database["public"]["Tables"]["exercise_attempts"]["Row"];
      };
      complete_learner_onboarding: {
        Args: never;
        Returns: {
          created_at: string;
          current_band: number | null;
          daily_study_minutes: number | null;
          onboarding_completed_at: string | null;
          onboarding_step: number;
          primary_goal: string | null;
          priority_skills: string[];
          study_days_per_week: number | null;
          target_band: number | null;
          target_exam_date: string | null;
          test_type: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "learner_profiles";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_active_placement_test: {
        Args: { p_slug?: string };
        Returns: Json;
      };
      start_placement_attempt: {
        Args: { p_idempotency_key: string; p_slug: string };
        Returns: {
          answers: Json;
          created_at: string;
          current_position: number;
          id: string;
          max_score: number | null;
          placement_test_id: string;
          recommended_level: string | null;
          revision: number;
          score: number | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "placement_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      save_placement_answer: {
        Args: {
          p_attempt_id: string;
          p_current_position: number;
          p_expected_revision: number;
          p_option_id: string;
          p_question_id: string;
        };
        Returns: Database["public"]["Tables"]["placement_attempts"]["Row"];
        SetofOptions: {
          from: "*";
          to: "placement_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      update_placement_position: {
        Args: {
          p_attempt_id: string;
          p_current_position: number;
          p_expected_revision: number;
        };
        Returns: Database["public"]["Tables"]["placement_attempts"]["Row"];
      };
      submit_placement_attempt: {
        Args: {
          p_answers: Json;
          p_attempt_id: string;
          p_idempotency_key: string;
        };
        Returns: {
          answers: Json;
          created_at: string;
          current_position: number;
          id: string;
          max_score: number | null;
          placement_test_id: string;
          recommended_level: string | null;
          revision: number;
          score: number | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "placement_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      complete_lesson_section: {
        Args: { p_lesson_id: string; p_section_id: string };
        Returns: {
          completed_at: string | null;
          created_at: string;
          current_section_id: string | null;
          last_accessed_at: string;
          lesson_id: string;
          lesson_version_id: string;
          progress_percent: number;
          started_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "learner_lesson_progress";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      complete_mock_test: {
        Args: { p_session_id: string };
        Returns: {
          created_at: string;
          generated_at: string;
          id: string;
          listening_max_score: number | null;
          listening_score: number | null;
          mock_test_version_id: string;
          reading_max_score: number | null;
          reading_score: number | null;
          session_id: string;
          speaking_attempt_id: string | null;
          user_id: string;
          writing_submission_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "mock_test_results";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_speaking_upload_intent: {
        Args: {
          p_attempt_id: string;
          p_duration_seconds: number;
          p_idempotency_key: string;
          p_mime_type: string;
          p_prompt_id: string;
          p_size_bytes: number;
        };
        Returns: Json;
      };
      fail_speaking_feedback_run: {
        Args: {
          p_error_code: string;
          p_run_id: string;
          p_signature: string;
          p_signature_expires_at: string;
        };
        Returns: undefined;
      };
      fail_speaking_transcript_run: {
        Args: {
          p_error_code: string;
          p_run_id: string;
          p_signature: string;
          p_signature_expires_at: string;
        };
        Returns: undefined;
      };
      fail_writing_feedback_run: {
        Args: {
          p_error_code: string;
          p_expires_at: string;
          p_run_id: string;
          p_signature: string;
        };
        Returns: Json;
      };
      finalize_speaking_feedback: {
        Args: {
          p_payload: string;
          p_run_id: string;
          p_signature: string;
          p_signature_expires_at: string;
        };
        Returns: {
          attempt_id: string;
          confidence: string;
          created_at: string;
          criteria: Json;
          disclaimer: string;
          estimated_fluency_band: number | null;
          estimated_grammar_band: number | null;
          estimated_lexical_band: number | null;
          estimated_overall_band: number | null;
          estimated_pronunciation_band: number | null;
          id: string;
          pronunciation_scope: string;
          run_id: string;
          strengths: Json;
          suggestions: Json;
          summary: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "speaking_feedback";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      finalize_speaking_transcript: {
        Args: {
          p_language_code: string;
          p_run_id: string;
          p_signature: string;
          p_signature_expires_at: string;
          p_transcript_text: string;
        };
        Returns: {
          created_at: string;
          id: string;
          language_code: string | null;
          response_id: string;
          run_id: string;
          transcript_text: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "speaking_transcripts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      finalize_speaking_upload: {
        Args: {
          p_intent_id: string;
          p_sha256_checksum: string;
          p_signature: string;
          p_signature_expires_at: string;
          p_verified_duration_seconds: number;
          p_verified_mime_type: string;
          p_verified_size_bytes: number;
        };
        Returns: {
          attempt_id: string;
          bucket_id: string;
          created_at: string;
          duration_seconds: number;
          id: string;
          mime_type: string;
          response_id: string;
          retention_until: string | null;
          sha256_checksum: string;
          size_bytes: number;
          status: string;
          storage_path: string;
          updated_at: string;
          upload_intent_id: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "speaking_audio_assets";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      finalize_writing_feedback: {
        Args: {
          p_expires_at: string;
          p_feedback_payload: string;
          p_run_id: string;
          p_signature: string;
        };
        Returns: Json;
      };
      get_exercise_attempt_result: {
        Args: { p_attempt_id: string };
        Returns: Json;
      };
      get_learner_mock_test_history: {
        Args: { p_limit?: number };
        Returns: {
          completed_at: string;
          href: string;
          listening_max_score: number;
          listening_score: number;
          mock_test_slug: string;
          reading_max_score: number;
          reading_score: number;
          session_id: string;
          started_at: string;
          status: string;
          submitted_at: string;
          title: string;
        }[];
      };
      get_learner_progress_overview: {
        Args: never;
        Returns: {
          active_mock_tests: number;
          active_practice: number;
          active_speaking: number;
          active_writing: number;
          completed_mock_tests: number;
          lesson_completed: number;
          lesson_in_progress: number;
          lesson_progress_percent: number;
          lesson_total: number;
        }[];
      };
      get_learner_recent_activity: {
        Args: { p_limit?: number };
        Returns: {
          activity_type: string;
          entity_id: string;
          feedback_status: string;
          href: string;
          max_score: number;
          occurred_at: string;
          score: number;
          skill: string;
          status: string;
          title: string;
        }[];
      };
      get_learner_skill_progress: {
        Args: never;
        Returns: {
          accuracy_percent: number;
          activity_count: number;
          feedback_status: string;
          latest_activity_at: string;
          scored_count: number;
          skill: string;
          total_max_score: number;
          total_score: number;
        }[];
      };
      get_vocabulary_progress_summary: {
        Args: never;
        Returns: {
          mastered: number;
          reviewed_today: number;
          reviewing: number;
        }[];
      };
      get_listening_attempt_clock: {
        Args: { p_attempt_id: string };
        Returns: {
          attempt_id: string;
          expires_at: string;
          server_now: string;
          started_at: string;
        }[];
      };
      get_listening_attempt_result: {
        Args: { p_attempt_id: string };
        Returns: Json;
      };
      get_mock_test_section_clock: {
        Args: { p_section_attempt_id: string };
        Returns: {
          expires_at: string;
          section_attempt_id: string;
          server_now: string;
          started_at: string;
          submitted_at: string;
        }[];
      };
      get_reading_attempt_clock: {
        Args: { p_attempt_id: string };
        Returns: {
          attempt_id: string;
          expires_at: string;
          server_now: string;
          started_at: string;
        }[];
      };
      get_speaking_pipeline_configuration_state: {
        Args: never;
        Returns: boolean;
      };
      get_writing_ai_configuration_state: { Args: never; Returns: boolean };
      get_writing_submission_clock: {
        Args: { p_submission_id: string };
        Returns: {
          expires_at: string;
          server_now: string;
          started_at: string;
          submitted_at: string;
        }[];
      };
      open_lesson_section: {
        Args: { p_lesson_id: string; p_section_id?: string };
        Returns: {
          completed_at: string | null;
          created_at: string;
          current_section_id: string | null;
          last_accessed_at: string;
          lesson_id: string;
          lesson_version_id: string;
          progress_percent: number;
          started_at: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "learner_lesson_progress";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      save_exercise_answer: {
        Args: {
          p_answer_text: string;
          p_attempt_id: string;
          p_client_revision: number;
          p_question_id: string;
          p_selected_option_ids: string[];
        };
        Returns: {
          answer_text: string | null;
          attempt_id: string;
          awarded_points: number | null;
          client_revision: number;
          created_at: string;
          exercise_set_version_id: string;
          finalized_at: string | null;
          id: string;
          is_correct: boolean | null;
          question_id: string;
          saved_at: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "learner_answers";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      save_writing_draft: {
        Args: {
          p_draft_text: string;
          p_expected_revision: number;
          p_submission_id: string;
        };
        Returns: {
          content_checksum: string | null;
          created_at: string;
          draft_text: string;
          expires_at: string;
          id: string;
          is_mock: boolean;
          last_saved_at: string;
          minimum_words_met: boolean;
          server_revision: number;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          submitted_text: string | null;
          updated_at: string;
          user_id: string;
          word_count: number;
          writing_task_id: string;
          writing_task_version_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "writing_submissions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      skip_mock_test_section: {
        Args: {
          p_idempotency_key: string;
          p_section_id: string;
          p_session_id: string;
        };
        Returns: {
          created_at: string;
          expires_at: string;
          id: string;
          learner_attempt_id: string | null;
          mock_test_section_id: string;
          mock_test_version_id: string;
          section_type: string;
          session_id: string;
          speaking_attempt_id: string | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
          writing_submission_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "mock_test_section_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      start_exercise_attempt: {
        Args: { p_exercise_slug: string; p_idempotency_key: string };
        Returns: {
          created_at: string;
          current_question_position: number;
          exercise_set_id: string;
          exercise_set_version_id: string;
          expires_at: string | null;
          id: string;
          is_mock: boolean;
          last_saved_at: string;
          max_score: number | null;
          reading_time_limit_seconds: number | null;
          score: number | null;
          scored_at: string | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submitted_at: string | null;
          time_limit_seconds: number | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "learner_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      record_vocabulary_review: {
        Args: { p_familiarity: string; p_vocabulary_entry_id: string };
        Returns: undefined;
      };
      start_mock_test: {
        Args: { p_idempotency_key: string; p_mock_test_slug: string };
        Returns: {
          completed_at: string | null;
          created_at: string;
          current_section_order: number | null;
          id: string;
          mock_test_id: string;
          mock_test_version_id: string;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "mock_test_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      start_mock_test_section: {
        Args: {
          p_idempotency_key: string;
          p_section_id: string;
          p_session_id: string;
        };
        Returns: {
          created_at: string;
          expires_at: string;
          id: string;
          learner_attempt_id: string | null;
          mock_test_section_id: string;
          mock_test_version_id: string;
          section_type: string;
          session_id: string;
          speaking_attempt_id: string | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
          writing_submission_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "mock_test_section_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      start_speaking_attempt: {
        Args: { p_idempotency_key: string; p_set_slug: string };
        Returns: {
          created_at: string;
          id: string;
          is_mock: boolean;
          speaking_set_id: string;
          speaking_set_version_id: string;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "speaking_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      start_speaking_feedback_request: {
        Args: {
          p_attempt_id: string;
          p_consent_version: string;
          p_idempotency_key: string;
          p_model: string;
          p_provider: string;
          p_transcript_bundle_checksum: string;
        };
        Returns: {
          attempt_id: string;
          attempt_number: number;
          completed_at: string | null;
          consent_version: string;
          created_at: string;
          error_code: string | null;
          id: string;
          lease_expires_at: string;
          model: string;
          prompt_version: string;
          provider: string;
          request_idempotency_key: string;
          requested_at: string;
          rubric_version: string;
          status: string;
          transcript_bundle_checksum: string;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "speaking_feedback_runs";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      start_speaking_transcript_request: {
        Args: {
          p_consent_version: string;
          p_idempotency_key: string;
          p_model: string;
          p_provider: string;
          p_response_id: string;
        };
        Returns: Json;
      };
      start_writing_feedback_request: {
        Args: {
          p_consent_version: string;
          p_idempotency_key: string;
          p_submission_id: string;
        };
        Returns: Json;
      };
      start_writing_submission: {
        Args: { p_idempotency_key: string; p_task_slug: string };
        Returns: {
          content_checksum: string | null;
          created_at: string;
          draft_text: string;
          expires_at: string;
          id: string;
          is_mock: boolean;
          last_saved_at: string;
          minimum_words_met: boolean;
          server_revision: number;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          submitted_text: string | null;
          updated_at: string;
          user_id: string;
          word_count: number;
          writing_task_id: string;
          writing_task_version_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "writing_submissions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_exercise_attempt: {
        Args: { p_attempt_id: string };
        Returns: {
          created_at: string;
          current_question_position: number;
          exercise_set_id: string;
          exercise_set_version_id: string;
          expires_at: string | null;
          id: string;
          is_mock: boolean;
          last_saved_at: string;
          max_score: number | null;
          reading_time_limit_seconds: number | null;
          score: number | null;
          scored_at: string | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submitted_at: string | null;
          time_limit_seconds: number | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "learner_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_mock_test: {
        Args: { p_idempotency_key: string; p_session_id: string };
        Returns: {
          completed_at: string | null;
          created_at: string;
          current_section_order: number | null;
          id: string;
          mock_test_id: string;
          mock_test_version_id: string;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "mock_test_sessions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_mock_test_section: {
        Args: { p_idempotency_key: string; p_section_attempt_id: string };
        Returns: {
          created_at: string;
          expires_at: string;
          id: string;
          learner_attempt_id: string | null;
          mock_test_section_id: string;
          mock_test_version_id: string;
          section_type: string;
          session_id: string;
          speaking_attempt_id: string | null;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
          writing_submission_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "mock_test_section_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_speaking_attempt: {
        Args: { p_attempt_id: string; p_idempotency_key: string };
        Returns: {
          created_at: string;
          id: string;
          is_mock: boolean;
          speaking_set_id: string;
          speaking_set_version_id: string;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_at: string | null;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "speaking_attempts";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      submit_writing_submission: {
        Args: { p_idempotency_key: string; p_submission_id: string };
        Returns: {
          content_checksum: string | null;
          created_at: string;
          draft_text: string;
          expires_at: string;
          id: string;
          is_mock: boolean;
          last_saved_at: string;
          minimum_words_met: boolean;
          server_revision: number;
          start_idempotency_key: string;
          started_at: string;
          status: string;
          submit_idempotency_key: string | null;
          submitted_after_time_limit: boolean | null;
          submitted_at: string | null;
          submitted_text: string | null;
          updated_at: string;
          user_id: string;
          word_count: number;
          writing_task_id: string;
          writing_task_version_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "writing_submissions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  private: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
