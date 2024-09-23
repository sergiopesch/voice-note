'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Trash2 } from 'lucide-react'

const PulsingAnimation = () => (
  <div className="relative w-3 h-3">
    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
    <div className="absolute inset-0 bg-red-500 rounded-full opacity-90"></div>
  </div>
)

export default function VoiceNotes() {
  const [isRecording, setIsRecording] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [currentTranscript, setCurrentTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
  let transcript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    const alternative = result[0];
    transcript += alternative.transcript;
  }

  setCurrentTranscript(transcript);

  if (event.results[event.results.length - 1].isFinal) {
    setNotes((prevNotes) => [...prevNotes, transcript]);
    setCurrentTranscript('');
  }
};
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setCurrentTranscript('')
    } else {
      recognitionRef.current?.start()
    }
    setIsRecording(!isRecording)
  }

  const deleteNote = (index: number) => {
    setNotes(prevNotes => prevNotes.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-8 font-sans flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-lg rounded-3xl overflow-hidden border-0">
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Voice Notes</h1>
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center">
              <Button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } shadow-md`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
                <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
              </Button>
              {isRecording && (
                <div className="mt-4 flex items-center gap-2">
                  <PulsingAnimation />
                  <span className="text-sm text-gray-600">Recording...</span>
                </div>
              )}
            </div>
            {isRecording && (
              <div className="bg-blue-100 rounded-2xl p-4 transition-all duration-300 shadow-md">
                <h2 className="text-lg font-semibold text-blue-800 mb-2 text-center">Live Transcript</h2>
                <p className="text-blue-900 text-center">{currentTranscript || 'Listening...'}</p>
              </div>
            )}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notes.map((note, index) => (
                <div key={index} className="group bg-gray-100 rounded-2xl p-4 transition-all duration-300 hover:shadow-md">
                  <div className="flex justify-between items-start">
                    <p className="text-gray-800 flex-grow">{note}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-500" />
                      <span className="sr-only">Delete note</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}