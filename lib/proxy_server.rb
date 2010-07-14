# Your starting point for daemon specific classes. This directory is
# already included in your load path, so no need to specify it.
require 'eventmachine'
require 'em-proxy'
require 'couchrest'

module RoomtrolServer
	class ProxyServer
		UNAUTHORIZED_RESP = 
			["HTTP/1.1 401 User is not authorized",
			"Server: RoomtrolProxy (Ubuntu Linux)"].join("\r\n")
			
		HTTP_MATCHER = /(GET|POST|PUT|DELETE|HEAD) (.+?)(?= HTTP)/
		COOKIE_MATCHER = /auth_token="(.+?)"/
		
		def initialize
			@couch = CouchRest.database!("http://127.0.0.1:5984/roomtrol_server")
		end
		def authenticate data, server, conn
			auth_token = data.split("Cookie:")[1].match(/auth_token="(.+?)"/)[1]
			user = @couch.view("auth/auth_tokens", {:key => auth_token})["rows"][0]
			if user && user["auth_expire"] > Time.now
				[data, [server]]
			else
				conn.send_data UNAUTHORIZED_RESP
			end
		end
		def run
			Proxy.start(:host => "0.0.0.0", :port => 80, :debug => true){
				conn.server :couch, :host => "127.0.0.1", :port => 5984
				conn.server :roomtrol, :host => "127.0.0.1", :port => 8124
				conn.server :http, :host => "127.0.0.1", :port => 81

				conn.on_data do |data|
					action, path = data.match(HTTP_MATCHER)[1..2]
					result = case path.split("/")[1]
					when "rooms"
						authenticate data, :couch, conn
					when "device"
						authenticate data, :roomtrol, conn
					when "auth"
						[data, [:roomtrol]]
					else
						[data, [:http]]
					end
					result
				end

				conn.on_response do |server, resp|
					resp
				end

				conn.on_finish do |name|
				end
			  
			}
		end
	end
end