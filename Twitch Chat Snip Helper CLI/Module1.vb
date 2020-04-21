Imports System.Drawing
Imports System.Drawing.Imaging
Imports System.Windows.Forms

Module Module1

    Sub Main(args As String())
        Try
            ' snip size / location
            Dim args_split = args(0).Split(":"c)
            Dim x = args_split(1)
            Dim y = args_split(2)
            Dim width = args_split(3)
            Dim height = args_split(4)
            Dim size As New Size(width, height)
            Dim bw_top = args_split(5)
            Dim bw_left = args_split(6)

            ' take screenshot and copy to clipboard
            Using snip = New Bitmap(width, height, PixelFormat.Format32bppArgb)
                Using graph = Graphics.FromImage(snip)
                    graph.CopyFromScreen(CType(x, Integer) + CType(bw_left, Integer), CType(y, Integer) + CType(bw_top, Integer), 0, 0, size, CopyPixelOperation.SourceCopy)
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
