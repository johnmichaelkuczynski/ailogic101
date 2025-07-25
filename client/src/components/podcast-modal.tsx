import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Headphones, Play, Pause, Download, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PodcastModalProps {
  selectedText?: string;
}

export function PodcastModal({ selectedText }: PodcastModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [voice, setVoice] = useState("en-US-JennyNeural");
  const [model, setModel] = useState("deepseek");
  const [customInstructions, setCustomInstructions] = useState("");
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const voices = [
    { value: "en-US-JennyNeural", label: "Jenny (Female, US)" },
    { value: "en-US-DavisNeural", label: "Davis (Male, US)" },
    { value: "en-US-AmberNeural", label: "Amber (Female, US)" },
    { value: "en-US-AndrewNeural", label: "Andrew (Male, US)" },
  ];

  const handleGeneratePodcast = async () => {
    if (!selectedText) {
      toast({
        title: "No Text Selected",
        description: "Please select some text to generate a podcast.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("/api/generate-podcast", {
        method: "POST",
        body: JSON.stringify({
          sourceText: selectedText,
          instructions: customMode ? customInstructions : "Generate default podcast summary",
          model,
          voice,
          customInstructions: customMode ? customInstructions : undefined
        })
      });

      const data = await response.json();
      setGeneratedPodcast(data.podcast);
      setIsPreview(data.isPreview);

      if (data.audioData) {
        // Create audio element from base64 data
        const audioBlob = new Blob([Buffer.from(data.audioData, 'base64')], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        setAudioElement(audio);
      }

      if (data.isPreview) {
        toast({
          title: "Preview Generated",
          description: "Sign up for full podcast generation and download.",
        });
      } else {
        toast({
          title: "Podcast Generated",
          description: "Your podcast is ready to play and download.",
        });
      }
    } catch (error) {
      console.error("Podcast generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate podcast. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioElement || !generatedPodcast) return;

    const link = document.createElement('a');
    link.href = audioElement.src;
    link.download = `podcast-${generatedPodcast.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Headphones className="w-4 h-4 mr-2" />
          🎧 Generate Podcast
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Podcast Summary</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Generation Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={!customMode ? "default" : "outline"}
                onClick={() => setCustomMode(false)}
                className="flex-1"
              >
                Default Mode
              </Button>
              <Button
                variant={customMode ? "default" : "outline"}
                onClick={() => setCustomMode(true)}
                className="flex-1"
              >
                Custom Instructions
              </Button>
            </div>
          </div>

          {/* Default Mode Description */}
          {!customMode && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold mb-2">Default Podcast Format:</h4>
              <ul className="text-sm space-y-1">
                <li>• Brief summary of the selected text</li>
                <li>• Analysis of strengths and weaknesses</li>
                <li>• Possible objections and counter-objections</li>
                <li>• Benefits and challenges for readers</li>
                <li>• Five representative quotations read aloud</li>
              </ul>
            </div>
          )}

          {/* Custom Instructions */}
          {customMode && (
            <div className="space-y-2">
              <Label htmlFor="custom-instructions">Custom Instructions</Label>
              <Textarea
                id="custom-instructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g., 'Rewrite as a snarky dialogue between two philosophers', 'Create a beginner-friendly explanation', etc."
                className="min-h-[100px]"
              />
            </div>
          )}

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label htmlFor="voice-select">Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model-select">AI Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                <SelectItem value="anthropic">Claude 3</SelectItem>
                <SelectItem value="perplexity">Perplexity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGeneratePodcast} 
            disabled={isGenerating || (customMode && !customInstructions.trim())}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Podcast"}
          </Button>

          {/* Generated Podcast Display */}
          {generatedPodcast && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                <h4 className="font-semibold">Generated Podcast</h4>
                {isPreview && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">
                    Preview
                  </span>
                )}
              </div>

              {/* Audio Controls */}
              {audioElement && (
                <div className="flex items-center gap-2">
                  <Button onClick={handlePlayPause} size="sm">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  {!isPreview && (
                    <Button onClick={handleDownload} size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              )}

              {/* Script Preview */}
              <div className="space-y-2">
                <Label>Podcast Script:</Label>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{generatedPodcast.script}</p>
                </div>
              </div>

              {isPreview && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm">
                    This is a preview. Sign up for unlimited access to full podcast generation, 
                    complete audio files, and download functionality.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PodcastModal;