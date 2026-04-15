
-- Create table for AI model configurations
CREATE TABLE public.ai_models (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  icon TEXT NOT NULL DEFAULT 'brain',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for agent-to-model assignments
CREATE TABLE public.agent_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  agent_description TEXT,
  assigned_model_id UUID REFERENCES public.ai_models(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for AWS credentials config (non-secret metadata only)
CREATE TABLE public.aws_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aws_config ENABLE ROW LEVEL SECURITY;

-- Public read access (config data, no secrets)
CREATE POLICY "Anyone can read models" ON public.ai_models FOR SELECT USING (true);
CREATE POLICY "Anyone can update models" ON public.ai_models FOR UPDATE USING (true);
CREATE POLICY "Anyone can read agent configs" ON public.agent_configurations FOR SELECT USING (true);
CREATE POLICY "Anyone can update agent configs" ON public.agent_configurations FOR UPDATE USING (true);
CREATE POLICY "Anyone can read aws config" ON public.aws_config FOR SELECT USING (true);
CREATE POLICY "Anyone can update aws config" ON public.aws_config FOR UPDATE USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON public.ai_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_configs_updated_at BEFORE UPDATE ON public.agent_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_aws_config_updated_at BEFORE UPDATE ON public.aws_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default models
INSERT INTO public.ai_models (name, provider, model_id, status, tasks_completed, icon) VALUES
  ('Claude 3.5 Sonnet', 'Anthropic', 'anthropic.claude-3-5-sonnet-20241022-v2:0', 'active', 45, 'brain'),
  ('Llama 3 70B', 'Meta', 'meta.llama3-70b-instruct-v1:0', 'active', 32, 'zap'),
  ('Titan Text Express', 'AWS', 'amazon.titan-text-express-v1', 'inactive', 0, 'database');

-- Seed agent configurations
INSERT INTO public.agent_configurations (agent_name, agent_description, assigned_model_id)
SELECT 'Planner Agent', 'Task decomposition & strategy', id FROM public.ai_models WHERE name = 'Claude 3.5 Sonnet';
INSERT INTO public.agent_configurations (agent_name, agent_description, assigned_model_id)
SELECT 'Researcher Agent', 'Context & knowledge retrieval', id FROM public.ai_models WHERE name = 'Claude 3.5 Sonnet';
INSERT INTO public.agent_configurations (agent_name, agent_description, assigned_model_id)
SELECT 'Coder Agent', 'Code generation & implementation', id FROM public.ai_models WHERE name = 'Llama 3 70B';
INSERT INTO public.agent_configurations (agent_name, agent_description, assigned_model_id)
SELECT 'Reviewer Agent', 'Testing & quality assurance', id FROM public.ai_models WHERE name = 'Llama 3 70B';

-- Seed AWS config
INSERT INTO public.aws_config (region) VALUES ('us-east-1');
