#INCLUDE "TOTVS.CH"
#INCLUDE "RESTFUL.CH"

WSRESTFUL saldoprod DESCRIPTION "SALDO PRODUTO"
	WSDATA CodProduto AS STRING 
	WSMETHOD GET DESCRIPTION "Retorna o saldo do produto" WSSYNTAX "/saldoprod/{CodProduto}"
END WSRESTFUL

WSMETHOD GET WSRECEIVE GetSaldo WSSERVICE saldoprod
	Local lRet := .F.
	Local nSaldoDisp := 0
	Local nAtu
	
	::SetContentType("application/json")
	
	If Len(::aURLParms) > 0
		dbSelectArea('SB1')
		SB1->(dbSetOrder(1))
		If SB1->(MsSeek(xFilial('SB1')+::aURLParms[1]))
			dbSelectArea("SB2")
			SB1->(dbSetOrder(1))
			If SB2->( MsSeek(xFilial("SB2") + SB1->B1_COD))
				nSaldoDisp := (SB2->B2_QATU - SB2->B2_RESERVA - SB2->B2_QEMP)
			EndIf
			::SetResponse('{"saldo":"'+cvaltochar(nSaldoDisp)+'"}')
			lRet := .T.
		Else
			SetRestFault(404, "Produto nao encontrado")
		EndIf
	Else
		SetRestFault(400, "Favor informar o codigo do produto")
	EndIf
Return(lRet)