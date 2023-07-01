typeset -gaU DENOVO_PATH
DENOVO_PATH+=("${0:a:h}")

function denovo-abbrev-expand() {
	denovo-dispatch abbrev expand "$LBUFFER" "$RBUFFER" > /dev/null
}
zle -N denovo-abbrev-expand

function denovo-abbrev-expand-and-accept-line() {
	denovo-dispatch abbrev expand-and-accept-line "$LBUFFER" "$RBUFFER" > /dev/null
}
zle -N denovo-abbrev-expand-and-accept-line
