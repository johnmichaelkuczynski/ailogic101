import * as sdk from "microsoft-cognitiveservices-speech-sdk";

interface AzureSpeechConfig {
  subscriptionKey: string;
  region: string;
  endpoint?: string;
}

// Azure Speech Service integration
export async function generateSpeech(text: string, voice: string = "en-US-JennyNeural"): Promise<Buffer> {
  try {
    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || "eastus";
    
    if (!subscriptionKey) {
      throw new Error("Azure Speech service not configured. Missing AZURE_SPEECH_KEY environment variable.");
    }

    // Create speech config
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
    speechConfig.speechSynthesisVoiceName = voice;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    // Create synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioData = Buffer.from(result.audioData);
            synthesizer.close();
            resolve(audioData);
          } else {
            const error = `Speech synthesis failed: ${result.errorDetails}`;
            console.error(error);
            synthesizer.close();
            reject(new Error(error));
          }
        },
        (error) => {
          console.error("Speech synthesis error:", error);
          synthesizer.close();
          reject(new Error(`Speech synthesis error: ${error}`));
        }
      );
    });
  } catch (error) {
    console.error("Azure Speech service error:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown speech synthesis error");
  }
}

// Generate podcast script prompt for AI
export function generatePodcastScript(sourceText: string, customInstructions?: string): string {
  if (customInstructions && customInstructions.trim()) {
    return `Create a podcast script based on this text following these custom instructions: "${customInstructions}"

Source Text:
${sourceText.substring(0, 3000)}

Please create an engaging podcast script that follows the custom instructions above. Keep it conversational and suitable for audio narration.`;
  }

  return `Create an engaging podcast summary of the following text in a conversational, radio-style format suitable for audio narration:

Source Text:
${sourceText.substring(0, 3000)}

Please create a podcast script that includes:
1. A brief, engaging introduction to the topic
2. A clear summary of the main points and key concepts
3. Analysis of the most important ideas and their significance
4. Discussion of any interesting implications or applications
5. A compelling conclusion that ties everything together

Keep the tone conversational and accessible, as if you're explaining these ideas to an intelligent listener who may not be familiar with the subject. Make it engaging and suitable for audio consumption. Aim for approximately 3-5 minutes of speaking time.`;
}

export default {
  generateSpeech,
  generatePodcastScript
};