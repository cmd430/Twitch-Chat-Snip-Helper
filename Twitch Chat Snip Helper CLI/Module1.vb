Imports System.Drawing
Imports System.Drawing.Imaging
Imports System.Windows.Forms

Module Module1

    Sub Main(args As String())
        Try
            ' snip size / location
            Dim x = args(0).Split(":"c)(1)
            Dim y = args(0).Split(":"c)(2)
            Dim width = args(0).Split(":"c)(3)
            Dim height = args(0).Split(":"c)(4)
            Dim size As New Size(width, height)


            ' offset for firefox window location
            Dim ff_top = 74
            Dim ff_left = 1280

            ' take screenshot and copy to clipboard
            Using snip = New Bitmap(width, height, PixelFormat.Format32bppArgb)
                Using graph = Graphics.FromImage(snip)
                    graph.CopyFromScreen(x + ff_left, y + ff_top, 0, 0, size, CopyPixelOperation.SourceCopy)
                End Using
                Clipboard.SetImage(snip)
            End Using

            'play notification sound to indicate success
            My.Computer.Audio.Play("C:\Windows\Media\Windows Notify System Generic.wav", AudioPlayMode.WaitToComplete)
        Catch ex As Exception
            'play error sound to indicate error
            My.Computer.Audio.Play("C:\Windows\Media\Windows Error.wav", AudioPlayMode.WaitToComplete)
        End Try
    End Sub

End Module
